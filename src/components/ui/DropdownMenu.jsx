"use client";

// Accessible dropdown menu (row action menus, overflow buttons).
// Keyboard support: ArrowDown/ArrowUp/Home/End move between items,
// Escape closes and returns focus to the trigger, Tab closes.
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";

export default function DropdownMenu({ trigger, items, label, align = "end" }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const close = useCallback(
    (focusTrigger = true) => {
      setOpen(false);
      setActiveIndex(-1);
      if (focusTrigger) triggerRef.current?.focus();
    },
    [],
  );

  // Close on outside interaction.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        close(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // Focus the active item whenever it changes.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const nodes = menuRef.current?.querySelectorAll('[role="menuitem"]');
    nodes?.[activeIndex]?.focus();
  }, [open, activeIndex]);

  const openWith = (index) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const onTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openWith(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openWith(items.length - 1);
    }
  };

  const onMenuKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(items.length - 1);
    }
  };

  const renderedTrigger = cloneElement(trigger, {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: (event) => {
      trigger.props.onClick?.(event);
      if (open) close(false);
      else openWith(-1);
    },
    onKeyDown: (event) => {
      trigger.props.onKeyDown?.(event);
      onTriggerKeyDown(event);
    },
  });

  return (
    <div className="relative inline-block">
      {renderedTrigger}
      {open ? (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={`absolute z-40 mt-1.5 min-w-44 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/10 dark:bg-[#262019] dark:ring-white/10 ${
            align === "start" ? "left-0" : "right-0"
          }`}
        >
          {items.map((item, index) => {
            const className = [
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium",
              "transition-colors outline-none",
              item.danger
                ? "text-error hover:bg-red-50 focus-visible:bg-red-50 dark:hover:bg-red-400/10 dark:focus-visible:bg-red-400/10"
                : "text-ink hover:bg-sand/60 focus-visible:bg-sand/60 dark:text-cream dark:hover:bg-white/10 dark:focus-visible:bg-white/10",
            ].join(" ");

            const inner = (
              <>
                {item.icon ? (
                  <span aria-hidden="true" className="shrink-0">
                    {item.icon}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  tabIndex={activeIndex === index ? 0 : -1}
                  className={className}
                  onClick={() => close(false)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={activeIndex === index ? 0 : -1}
                className={className}
                onClick={() => {
                  close();
                  item.onSelect?.();
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
