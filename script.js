/* LUMÉ Skin — interactions */
(function () {
  "use strict";

  /* ---- Apply admin-edited content (from localStorage) ---- */
  (function applyContent() {
    var data;
    try { data = JSON.parse(localStorage.getItem("lumiere_content") || "{}"); }
    catch (e) { return; }
    Object.keys(data).forEach(function (key) {
      var value = data[key];
      if (value == null || value === "") return;
      document.querySelectorAll('[data-edit="' + key + '"]').forEach(function (el) {
        el.textContent = value;
        /* keep tel:/mailto: links working when their text is edited */
        if (key === "contact_phone" && el.tagName === "A") el.href = "tel:" + value.replace(/[^0-9+]/g, "");
        if (key === "contact_email" && el.tagName === "A") el.href = "mailto:" + value.trim();
      });
    });
  })();

  /* ---- Apply admin-edited images (from localStorage) ---- */
  (function applyImages() {
    var HERO_GRADIENT = "linear-gradient(100deg, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.7) 42%, rgba(250,247,242,0.15) 70%)";
    var imgs;
    try { imgs = JSON.parse(localStorage.getItem("lumiere_images") || "{}"); }
    catch (e) { return; }
    Object.keys(imgs).forEach(function (key) {
      var url = imgs[key];
      if (!url) return;
      document.querySelectorAll('[data-img-edit="' + key + '"]').forEach(function (el) {
        el.style.backgroundImage = (key === "hero" ? HERO_GRADIENT + ", " : "") + 'url("' + url + '")';
      });
    });
  })();

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var fab = document.querySelector(".fab");

  /* Sticky header shadow + FAB reveal on scroll */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-stuck", y > 12);
    if (fab) fab.classList.toggle("is-visible", y > 620);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu toggle */
  if (burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    /* Close menu when a link is tapped */
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    });
  }

  /* Scroll reveal animations */
  var revealTargets = [
    ".about__grid", ".section__head", ".card", ".feature",
    ".step", ".review", ".book__grid", ".trust__item"
  ];
  var revealEls = [];
  revealTargets.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 0.08 + "s";
      revealEls.push(el);
    });
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Booking form (demo submit — no backend) */
  var form = document.getElementById("bookForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      if (!name.value.trim() || !email.value.trim()) {
        (!name.value.trim() ? name : email).focus();
        return;
      }
      /* Save the enquiry so it appears in the admin dashboard (demo, localStorage) */
      try {
        var list = JSON.parse(localStorage.getItem("lumiere_enquiries") || "[]");
        list.unshift({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: (form.querySelector("#phone") || {}).value || "",
          treatment: (form.querySelector("#treatment") || {}).value || "",
          message: (form.querySelector("#message") || {}).value || "",
          received: "Just now"
        });
        localStorage.setItem("lumiere_enquiries", JSON.stringify(list.slice(0, 50)));
      } catch (err) { /* storage unavailable — non-blocking */ }

      if (note) {
        note.hidden = false;
        note.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* Update copyright year automatically */
  var yearHolder = document.querySelector(".footer__bottom p");
  if (yearHolder) {
    yearHolder.innerHTML = yearHolder.innerHTML.replace("2026", new Date().getFullYear());
  }
})();
