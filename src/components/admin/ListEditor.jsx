"use client";

// Generic add/remove editor for array-of-object content:
// hero stats, press names, about paragraphs, contact details, socials.
// The caller describes the fields; this component owns the row UI.
import Field, {
  inputClass,
  selectClass,
} from "@/components/ui/Field.jsx";
import { IconPlus, IconTrash } from "@/components/ui/icons.jsx";

export default function ListEditor({
  label,
  rows,
  onChange,
  fields,
  template,
  addLabel = "Add item",
  max = 10,
  emptyMessage = "No items yet.",
}) {
  const updateRow = (index, key, value) => {
    onChange(
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const removeRow = (index) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (rows.length < max) onChange([...rows, template()]);
  };

  return (
    <fieldset className="grid min-w-0 gap-3 rounded-xl border border-sand/80 p-4 dark:border-white/10">
      <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/55">
        {label}
      </legend>

      {rows.length === 0 ? (
        <p className="rounded-lg bg-cream/70 px-3 py-3 text-sm text-muted dark:bg-white/[0.04] dark:text-white/50">
          {emptyMessage}
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid min-w-0 gap-3 rounded-lg bg-cream/60 p-3 dark:bg-white/[0.04] sm:grid-cols-2"
        >
          {fields.map((field) => {
            const id = `list-${label}-${index}-${field.key}`;
            return (
              <Field
                key={field.key}
                id={id}
                label={field.label}
                className={field.wide ? "sm:col-span-2" : undefined}
              >
                {field.type === "textarea" ? (
                  <textarea
                    id={id}
                    rows={field.rows ?? 3}
                    value={row[field.key] ?? ""}
                    onChange={(event) =>
                      updateRow(index, field.key, event.target.value)
                    }
                    className={`${inputClass} min-h-[4.5rem] resize-y`}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={id}
                    value={row[field.key] ?? ""}
                    onChange={(event) =>
                      updateRow(index, field.key, event.target.value)
                    }
                    className={selectClass}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    type="text"
                    value={row[field.key] ?? ""}
                    onChange={(event) =>
                      updateRow(index, field.key, event.target.value)
                    }
                    className={inputClass}
                  />
                )}
              </Field>
            );
          })}

          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/40 dark:text-white/35">
              Item {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-error underline-offset-4 transition-opacity hover:opacity-80"
            >
              <IconTrash className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= max}
          className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-muted transition-all hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
        >
          <IconPlus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    </fieldset>
  );
}
