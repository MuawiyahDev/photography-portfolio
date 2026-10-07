(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");

  function setMenu(open) {
    if (!toggle || !navList) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navList.classList.toggle("is-open", open);
  }

  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close the menu when a link is chosen or Escape is pressed.
    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenu(false);
        if (document.activeElement === toggle) toggle.blur();
      }
    });
  }

  /* ---------- Gallery filtering ---------- */
  var filterBtns = Array.prototype.slice.call(
    document.querySelectorAll(".filter-btn"),
  );
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var status = document.getElementById("filter-status");

  function applyFilter(value, btn) {
    var visible = 0;
    items.forEach(function (item) {
      var show =
        value === "all" || item.getAttribute("data-category") === value;
      item.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    filterBtns.forEach(function (b) {
      var active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    if (status) {
      var label = value === "all" ? "all" : value.replace("-", " ");
      status.textContent =
        visible === 0
          ? "No works in this series yet."
          : "Showing " +
            visible +
            " of " +
            items.length +
            " works — " +
            label +
            ".";
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"), btn);
    });
  });

  /* ---------- Booking form validation (front-end only) ---------- */
  var form = document.getElementById("booking-form");
  var formStatus = document.getElementById("form-status");

  function setError(input, errorId, message) {
    var errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errorId);
    } else {
      errorEl.textContent = "";
      errorEl.hidden = true;
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("field-name");
      var email = document.getElementById("field-email");
      var type = document.getElementById("field-type");
      var message = document.getElementById("field-message");
      var valid = true;

      var nameValue = name.value.trim();
      if (nameValue.length < 2) {
        setError(
          name,
          "error-name",
          "Please enter your name (at least 2 characters).",
        );
        valid = false;
      } else {
        setError(name, "error-name", "");
      }

      var emailValue = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
        setError(email, "error-email", "Please enter a valid email address.");
        valid = false;
      } else {
        setError(email, "error-email", "");
      }

      if (!type.value) {
        setError(type, "error-type", "Please choose a project type.");
        valid = false;
      } else {
        setError(type, "error-type", "");
      }

      if (message.value.trim().length < 20) {
        setError(
          message,
          "error-message",
          "Tell me a little more (at least 20 characters).",
        );
        valid = false;
      } else {
        setError(message, "error-message", "");
      }

      if (!valid) {
        formStatus.textContent =
          "Please fix the highlighted fields and try again.";
        formStatus.className = "form-status is-error";
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Static site: no backend. Confirm receipt and reset.
      formStatus.textContent =
        "Thank you, " +
        nameValue +
        ". Your inquiry was received — I’ll reply within two working days.";
      formStatus.className = "form-status is-success";
      form.reset();
    });

    // Clear a field's error as the user fixes it.
    form.addEventListener("input", function (event) {
      var target = event.target;
      if (target && target.hasAttribute("aria-invalid")) {
        var describedBy = target.getAttribute("aria-describedby");
        if (describedBy) setError(target, describedBy, "");
      }
    });
  }
})();
