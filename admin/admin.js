/* ============================================================
   LUMÉ Skin — Admin Dashboard logic
   ============================================================ */
(function () {
  "use strict";

  /* Access to this page is protected server-side by Edge Middleware, which
     redirects to the login screen unless a valid session cookie is present. */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var initials = function (name) {
    return name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  };

  /* ============================================================
     MOCK DATA
     ============================================================ */
  var appointments = [
    { name: "Sarah Mitchell", treatment: "Laser Hair Removal", date: "Today", time: "9:30 AM", clinician: "Nurse Amelia", status: "Confirmed" },
    { name: "Chloe Turner", treatment: "Anti-Ageing Injectables", date: "Today", time: "10:15 AM", clinician: "Dr. Hana", status: "Confirmed" },
    { name: "Priya Nair", treatment: "Skin Rejuvenation", date: "Today", time: "11:00 AM", clinician: "Nurse Amelia", status: "Pending" },
    { name: "Jessica Wong", treatment: "Advanced Facial", date: "Today", time: "1:30 PM", clinician: "Therapist Mia", status: "Confirmed" },
    { name: "Olivia Brown", treatment: "Pigmentation Program", date: "Today", time: "3:00 PM", clinician: "Dr. Hana", status: "Pending" },
    { name: "Emma Davis", treatment: "Body & Skin Tightening", date: "18 Jul", time: "9:00 AM", clinician: "Therapist Mia", status: "Confirmed" },
    { name: "Sophie Clark", treatment: "Laser Hair Removal", date: "18 Jul", time: "2:15 PM", clinician: "Nurse Amelia", status: "Confirmed" },
    { name: "Isla Robinson", treatment: "Advanced Facial", date: "16 Jul", time: "10:00 AM", clinician: "Therapist Mia", status: "Completed" },
    { name: "Grace Lee", treatment: "Skin Rejuvenation", date: "15 Jul", time: "4:00 PM", clinician: "Dr. Hana", status: "Completed" },
    { name: "Hannah Scott", treatment: "Anti-Ageing Injectables", date: "14 Jul", time: "11:30 AM", clinician: "Dr. Hana", status: "Cancelled" }
  ];

  var clients = [
    { name: "Sarah Mitchell", email: "sarah.m@email.com", phone: "0412 334 556", visits: 14, last: "12 Jul 2026", ltv: "$3,240", status: "VIP" },
    { name: "Chloe Turner", email: "chloe.t@email.com", phone: "0433 221 908", visits: 9, last: "10 Jul 2026", ltv: "$2,110", status: "Active" },
    { name: "Priya Nair", email: "priya.n@email.com", phone: "0401 556 233", visits: 6, last: "08 Jul 2026", ltv: "$1,480", status: "Active" },
    { name: "Jessica Wong", email: "jess.w@email.com", phone: "0455 903 112", visits: 21, last: "05 Jul 2026", ltv: "$5,760", status: "VIP" },
    { name: "Olivia Brown", email: "liv.b@email.com", phone: "0422 118 774", visits: 2, last: "01 Jul 2026", ltv: "$390", status: "New" },
    { name: "Emma Davis", email: "emma.d@email.com", phone: "0466 220 551", visits: 11, last: "28 Jun 2026", ltv: "$2,880", status: "Active" },
    { name: "Sophie Clark", email: "sophie.c@email.com", phone: "0477 332 019", visits: 1, last: "26 Jun 2026", ltv: "$180", status: "New" }
  ];

  var treatments = [
    { name: "Laser Hair Removal", desc: "Full body or per-area laser treatment for all skin tones.", price: "$99+", dur: "30–60 min" },
    { name: "Skin Rejuvenation", desc: "Microneedling & resurfacing for texture and firmness.", price: "$249", dur: "60 min" },
    { name: "Anti-Ageing Injectables", desc: "Wrinkle-relaxing & dermal filler by registered nurses.", price: "$320", dur: "45 min" },
    { name: "Advanced Facial", desc: "Medical-grade facial with peel & LED therapy.", price: "$180", dur: "60 min" },
    { name: "Pigmentation Program", desc: "Targeted treatment for melasma & sun damage.", price: "$275", dur: "45 min" },
    { name: "Body & Skin Tightening", desc: "Non-invasive RF contouring and firming.", price: "$210", dur: "50 min" }
  ];

  var reviews = [
    { name: "Sarah M.", loc: "Bondi, NSW", stars: 5, text: "The team genuinely cares. My skin has never looked better." },
    { name: "Chloe T.", loc: "Surry Hills, NSW", stars: 5, text: "Professional, spotless clinic and honest advice. Life-changing results." },
    { name: "Priya N.", loc: "Parramatta, NSW", stars: 5, text: "Best skin clinic in Sydney. Thorough consultation, no pressure." },
    { name: "Jessica W.", loc: "Chatswood, NSW", stars: 4, text: "Lovely experience and great results. Booking was easy too." },
    { name: "Olivia B.", loc: "Newtown, NSW", stars: 5, text: "Felt so comfortable. The clinicians really know their craft." },
    { name: "Emma D.", loc: "Manly, NSW", stars: 5, text: "Beautiful clinic, warm staff and visible improvement in weeks." }
  ];

  /* Seed enquiries — real ones from the website form get prepended */
  var seedEnquiries = [
    { name: "Amelia Ford", email: "amelia.f@email.com", phone: "0410 223 887", treatment: "Laser Hair Removal", message: "Keen to start a course — what's the July offer?", received: "Today, 8:42 AM" },
    { name: "Ruby Nguyen", email: "ruby.n@email.com", phone: "0432 907 551", treatment: "Anti-Ageing & Injectables", message: "First time, would love a consultation.", received: "Yesterday, 6:15 PM" },
    { name: "Lily Adams", email: "lily.a@email.com", phone: "0455 118 220", treatment: "Not sure — please advise", message: "Have some pigmentation I'd like looked at.", received: "15 Jul, 2:30 PM" }
  ];

  function getEnquiries() {
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem("lumiere_enquiries") || "[]"); } catch (e) {}
    return stored.concat(seedEnquiries);
  }

  /* ============================================================
     PAGE CONTENT EDITOR
     Schema mirrors the data-edit keys in ../index.html
     ============================================================ */
  var contentSchema = [
    { group: "Announcement Bar", fields: [
      { key: "announce_strong", label: "Bold text", type: "text", def: "Winter Glow Offer" },
      { key: "announce_text", label: "Remaining text", type: "text", def: " — 30% off your first laser hair removal course this July" }
    ]},
    { group: "Hero (top banner)", fields: [
      { key: "hero_eyebrow", label: "Small label", type: "text", def: "Sydney · Est. 2014" },
      { key: "hero_title_1", label: "Headline line 1", type: "text", def: "Trusted care." },
      { key: "hero_title_2", label: "Headline line 2 (accent)", type: "text", def: "Radiant, healthy skin." },
      { key: "hero_lead", label: "Intro paragraph", type: "textarea", def: "A medical-grade cosmetic and dermal clinic in the heart of Sydney. Personalised treatment plans, qualified dermal clinicians, and results you can see and feel." }
    ]},
    { group: "About Section", fields: [
      { key: "about_eyebrow", label: "Small label", type: "text", def: "About the clinic" },
      { key: "about_title", label: "Heading", type: "text", def: "Where clinical expertise meets a calm, considered experience" },
      { key: "about_p1", label: "Paragraph 1", type: "textarea", def: "Founded in 2014, LUMÉ Skin brings together medical-grade technology and genuine care. Every journey begins with a thorough skin consultation, so your plan is built around your skin — not a one-size-fits-all package." },
      { key: "about_p2", label: "Paragraph 2", type: "textarea", def: "Our team of registered nurses and qualified dermal clinicians follow Australian safety standards and use only TGA-approved devices and products." }
    ]},
    { group: "Treatments Section", fields: [
      { key: "services_title", label: "Heading", type: "text", def: "Treatments tailored to your skin goals" },
      { key: "services_sub", label: "Subheading", type: "textarea", def: "Comprehensive, medical-grade care across six core areas — delivered by clinicians who take the time to get it right." },
      { key: "svc1_title", label: "Card 1 — title", type: "text", def: "Laser Hair Removal" },
      { key: "svc1_desc", label: "Card 1 — description", type: "textarea", def: "Safe, effective and long-lasting. Advanced laser technology suited to all skin tones and body areas." },
      { key: "svc2_title", label: "Card 2 — title", type: "text", def: "Skin Rejuvenation" },
      { key: "svc2_desc", label: "Card 2 — description", type: "textarea", def: "Microneedling, skin needling and resurfacing to restore texture, firmness and a natural glow." },
      { key: "svc3_title", label: "Card 3 — title", type: "text", def: "Anti-Ageing & Injectables" },
      { key: "svc3_desc", label: "Card 3 — description", type: "textarea", def: "Wrinkle-relaxing and dermal filler treatments performed by registered nurses for subtle, refined results." },
      { key: "svc4_title", label: "Card 4 — title", type: "text", def: "Advanced Facials" },
      { key: "svc4_desc", label: "Card 4 — description", type: "textarea", def: "Medical-grade facials, peels and LED light therapy to deeply cleanse, brighten and hydrate." },
      { key: "svc5_title", label: "Card 5 — title", type: "text", def: "Pigmentation & Acne" },
      { key: "svc5_desc", label: "Card 5 — description", type: "textarea", def: "Targeted programs for melasma, sun damage and active acne — clearer, more even skin over time." },
      { key: "svc6_title", label: "Card 6 — title", type: "text", def: "Body & Skin Tightening" },
      { key: "svc6_desc", label: "Card 6 — description", type: "textarea", def: "Non-invasive RF skin tightening and body contouring to firm, smooth and sculpt." }
    ]},
    { group: "Why Us Section", fields: [
      { key: "why_title", label: "Heading", type: "text", def: "The difference is in the detail" },
      { key: "why_sub", label: "Subheading", type: "textarea", def: "We believe great skin care is equal parts science and trust. Here's what you can expect every visit." }
    ]},
    { group: "Reviews Section", fields: [
      { key: "reviews_title", label: "Heading", type: "text", def: "Trusted by thousands of Sydneysiders" },
      { key: "reviews_sub", label: "Subheading", type: "text", def: "Rated 4.9 out of 5 across 600+ Google reviews." }
    ]},
    { group: "Booking / Contact Section", fields: [
      { key: "book_title", label: "Heading", type: "text", def: "Ready to begin? Let's talk skin." },
      { key: "book_sub", label: "Intro text", type: "textarea", def: "Request your complimentary consultation and our team will be in touch within one business day." },
      { key: "contact_address", label: "Address", type: "text", def: "Level 3, 88 George Street, Sydney NSW 2000" },
      { key: "contact_phone", label: "Phone", type: "text", def: "02 8555 0199" },
      { key: "contact_email", label: "Email", type: "text", def: "i.alhindawi5@gmail.com" },
      { key: "contact_hours", label: "Opening hours", type: "text", def: "Mon–Fri 9am–7pm · Sat 9am–4pm" }
    ]}
  ];

  function getContent() {
    try { return JSON.parse(localStorage.getItem("lumiere_content") || "{}"); } catch (e) { return {}; }
  }

  function renderContentEditor() {
    var saved = getContent();
    var html = contentSchema.map(function (grp) {
      var fields = grp.fields.map(function (f) {
        var val = saved[f.key] != null ? saved[f.key] : f.def;
        var isWide = f.type === "textarea";
        var input = isWide
          ? '<textarea rows="3" data-key="' + f.key + '">' + esc(val) + "</textarea>"
          : '<input type="text" data-key="' + f.key + '" value="' + esc(val) + '" />';
        return '<div class="cfield' + (isWide ? " cfield--wide" : "") + '"><label>' + esc(f.label) + "</label>" + input + "</div>";
      }).join("");
      return '<div class="panel content-group"><h2>' + esc(grp.group) + '</h2><div class="cfields">' + fields + "</div></div>";
    }).join("");
    $("#contentEditor").innerHTML = html;
  }

  function saveContent() {
    var data = {};
    $$("#contentEditor [data-key]").forEach(function (el) { data[el.getAttribute("data-key")] = el.value; });
    try { localStorage.setItem("lumiere_content", JSON.stringify(data)); } catch (e) {}
    var toast = $("#saveToast");
    toast.hidden = false;
    clearTimeout(saveContent._t);
    saveContent._t = setTimeout(function () { toast.hidden = true; }, 4000);
  }

  /* ============================================================
     WEBSITE IMAGES EDITOR
     Keys mirror data-img-edit in ../index.html
     ============================================================ */
  var imageSchema = [
    { key: "hero",   label: "Hero background", def: "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=1600&q=80" },
    { key: "about1", label: "About — main photo", def: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80" },
    { key: "about2", label: "About — small photo", def: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80" },
    { key: "svc1",   label: "Treatment — Laser Hair Removal", def: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=80" },
    { key: "svc2",   label: "Treatment — Skin Rejuvenation", def: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=700&q=80" },
    { key: "svc3",   label: "Treatment — Anti-Ageing & Injectables", def: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=700&q=80" },
    { key: "svc4",   label: "Treatment — Advanced Facials", def: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=700&q=80" },
    { key: "svc5",   label: "Treatment — Pigmentation & Acne", def: "https://images.unsplash.com/photo-1614859324967-bdf413c35a7f?auto=format&fit=crop&w=700&q=80" },
    { key: "svc6",   label: "Treatment — Body & Skin Tightening", def: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=700&q=80" }
  ];

  function getImages() {
    try { return JSON.parse(localStorage.getItem("lumiere_images") || "{}"); } catch (e) { return {}; }
  }
  function setImage(key, url) {
    var imgs = getImages();
    if (url) { imgs[key] = url; } else { delete imgs[key]; }
    try { localStorage.setItem("lumiere_images", JSON.stringify(imgs)); } catch (e) {
      alert("Could not save — the image may be too large. Try a smaller file or use an image URL instead.");
      return false;
    }
    return true;
  }
  function currentImage(key) {
    var imgs = getImages();
    if (imgs[key]) return imgs[key];
    for (var i = 0; i < imageSchema.length; i++) if (imageSchema[i].key === key) return imageSchema[i].def;
    return "";
  }
  function imgToast(msg) {
    var t = $("#imgToast");
    t.textContent = msg || "✓ Image updated — refresh your website tab to see it live.";
    t.hidden = false;
    clearTimeout(imgToast._t);
    imgToast._t = setTimeout(function () { t.hidden = true; }, 4000);
  }

  function renderImageEditor() {
    $("#imageEditor").innerHTML = imageSchema.map(function (m) {
      var overridden = getImages()[m.key] ? '<span class="img-tag">Custom</span>' : "";
      return '<div class="img-card" data-key="' + m.key + '">' +
        '<div class="img-thumb" style="background-image:url(\'' + currentImage(m.key) + '\')"></div>' +
        '<div class="img-body"><div class="img-label">' + esc(m.label) + overridden + "</div>" +
        '<div class="img-actions">' +
        '<label class="abtn abtn--ghost img-upload">Upload<input type="file" accept="image/*" data-upload="' + m.key + '" hidden></label>' +
        '<button class="row-btn" data-reset="' + m.key + '">Reset</button>' +
        "</div>" +
        '<input type="text" class="img-url" placeholder="…or paste an image URL and press Enter" data-url="' + m.key + '">' +
        "</div></div>";
    }).join("");
  }

  /* Delegated events for the image editor */
  document.addEventListener("change", function (e) {
    var up = e.target.getAttribute && e.target.getAttribute("data-upload");
    if (up && e.target.files && e.target.files[0]) {
      var file = e.target.files[0];
      if (file.size > 2.5 * 1024 * 1024) {
        alert("That image is quite large (" + Math.round(file.size / 1024) + " KB). For this demo please use an image under ~2.5 MB, or paste a URL instead.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        if (setImage(up, reader.result)) { renderImageEditor(); imgToast(); }
      };
      reader.readAsDataURL(file);
    }
  });
  document.addEventListener("keydown", function (e) {
    var urlKey = e.target.getAttribute && e.target.getAttribute("data-url");
    if (urlKey && e.key === "Enter") {
      e.preventDefault();
      var val = e.target.value.trim();
      if (setImage(urlKey, val)) { renderImageEditor(); imgToast(val ? undefined : "✓ Reset to the original image."); }
    }
  });
  document.addEventListener("click", function (e) {
    var rk = e.target.getAttribute && e.target.getAttribute("data-reset");
    if (rk) { setImage(rk, ""); renderImageEditor(); imgToast("✓ Reset to the original image."); }
  });

  /* ============================================================
     RENDER
     ============================================================ */
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* Appointments table */
  function renderAppointments(filter) {
    var tbody = $("#apptTable tbody");
    var rows = appointments.filter(function (a) { return !filter || filter === "all" || a.status === filter; });
    tbody.innerHTML = rows.map(function (a) {
      return "<tr>" +
        '<td><div class="td-name"><span class="av">' + initials(a.name) + "</span><strong>" + esc(a.name) + "</strong></div></td>" +
        "<td>" + esc(a.treatment) + "</td>" +
        "<td>" + esc(a.date) + " · " + esc(a.time) + "</td>" +
        "<td>" + esc(a.clinician) + "</td>" +
        '<td><span class="badge badge--' + a.status + '">' + a.status + "</span></td>" +
        '<td><button class="row-btn">Manage</button></td>' +
        "</tr>";
    }).join("");
  }

  /* Clients table */
  function renderClients() {
    var tbody = $("#clientTable tbody");
    tbody.innerHTML = clients.map(function (c) {
      return "<tr>" +
        '<td><div class="td-name"><span class="av">' + initials(c.name) + "</span><strong>" + esc(c.name) + "</strong></div></td>" +
        '<td>' + esc(c.email) + '<div class="muted-sm">' + esc(c.phone) + "</div></td>" +
        "<td>" + c.visits + "</td>" +
        "<td>" + esc(c.last) + "</td>" +
        "<td>" + esc(c.ltv) + "</td>" +
        '<td><span class="badge badge--' + c.status + '">' + c.status + "</span></td>" +
        "</tr>";
    }).join("");
  }

  /* Treatments cards */
  function renderTreatments() {
    $("#treatmentCards").innerHTML = treatments.map(function (t) {
      return '<div class="tcard"><h3>' + esc(t.name) + "</h3><p>" + esc(t.desc) + "</p>" +
        '<div class="t-meta"><span class="t-price">' + esc(t.price) + '</span><span class="t-dur">' + esc(t.dur) + "</span></div></div>";
    }).join("");
  }

  /* Reviews */
  function renderReviews() {
    $("#reviewCards").innerHTML = reviews.map(function (r) {
      var stars = "★★★★★".slice(0, r.stars) + "☆☆☆☆☆".slice(0, 5 - r.stars);
      return '<div class="rcard"><div class="stars">' + stars + "</div><p>" + esc(r.text) + "</p>" +
        '<footer><span class="av">' + initials(r.name) + "</span><div><strong>" + esc(r.name) +
        '</strong><br><span>' + esc(r.loc) + "</span></div></footer></div>";
    }).join("");

    var dist = [
      { s: 5, pct: 88 }, { s: 4, pct: 8 }, { s: 3, pct: 2 }, { s: 2, pct: 1 }, { s: 1, pct: 1 }
    ];
    $("#ratingBars").innerHTML = dist.map(function (d) {
      return '<div class="rs-row"><span>' + d.s + ' ★</span><div class="bar-track"><div class="bar-fill" style="width:' +
        d.pct + '%"></div></div><span>' + d.pct + "%</span></div>";
    }).join("");
  }

  /* Enquiries table */
  function renderEnquiries() {
    var list = getEnquiries();
    $("#enqCount").textContent = list.length;
    var tbody = $("#enqTable tbody");
    tbody.innerHTML = list.map(function (e) {
      return "<tr>" +
        '<td><div class="td-name"><span class="av">' + initials(e.name || "?") + "</span><strong>" + esc(e.name) + "</strong></div></td>" +
        "<td>" + esc(e.email) + '<div class="muted-sm">' + esc(e.phone || "—") + "</div></td>" +
        "<td>" + esc(e.treatment || "—") + "</td>" +
        '<td class="muted-sm">' + esc(e.message || "—") + "</td>" +
        "<td>" + esc(e.received) + "</td>" +
        '<td><button class="row-btn">Reply</button></td>' +
        "</tr>";
    }).join("");
  }

  /* Dashboard mini-lists */
  function renderDashboardLists() {
    var today = appointments.filter(function (a) { return a.date === "Today"; });
    $("#todaySchedule").innerHTML = today.map(function (a) {
      return '<div class="mini-item"><span class="av">' + initials(a.name) + '</span>' +
        '<div class="mi-main"><strong>' + esc(a.name) + "</strong><span>" + esc(a.treatment) + "</span></div>" +
        '<span class="mi-time">' + esc(a.time) + "</span></div>";
    }).join("");

    var enq = getEnquiries().slice(0, 4);
    $("#latestEnquiries").innerHTML = enq.map(function (e) {
      return '<div class="mini-item"><span class="av">' + initials(e.name || "?") + '</span>' +
        '<div class="mi-main"><strong>' + esc(e.name) + "</strong><span>" + esc(e.treatment || "General enquiry") + "</span></div>" +
        '<span class="mi-time">' + esc((e.received || "").split(",")[0]) + "</span></div>";
    }).join("");

    $("#apptCount").textContent = today.length;
  }

  /* Bar chart — revenue by treatment */
  function renderBarChart() {
    var data = [
      { label: "Laser Hair Removal", val: 14200 },
      { label: "Injectables", val: 11800 },
      { label: "Rejuvenation", val: 8600 },
      { label: "Facials", val: 6900 },
      { label: "Pigmentation", val: 4200 },
      { label: "Tightening", val: 2550 }
    ];
    var max = Math.max.apply(null, data.map(function (d) { return d.val; }));
    $("#barChart").innerHTML = data.map(function (d) {
      return '<div class="bar-row"><span>' + esc(d.label) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" data-w="' + (d.val / max * 100) + '"></div></div>' +
        '<span class="bar-val">$' + (d.val / 1000).toFixed(1) + "k</span></div>";
    }).join("");
    // animate widths after paint
    requestAnimationFrame(function () {
      $$("#barChart .bar-fill").forEach(function (el) { el.style.width = el.getAttribute("data-w") + "%"; });
    });
  }

  /* Line chart — bookings last 8 weeks (SVG) */
  function renderLineChart() {
    var vals = [42, 55, 48, 63, 59, 71, 68, 82];
    var w = 560, h = 200, pad = 14;
    var max = Math.max.apply(null, vals) * 1.1, min = 0;
    var stepX = (w - pad * 2) / (vals.length - 1);
    var pts = vals.map(function (v, i) {
      var x = pad + i * stepX;
      var y = h - pad - (v - min) / (max - min) * (h - pad * 2);
      return [x, y];
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = line + " L" + pts[pts.length - 1][0].toFixed(1) + " " + (h - pad) + " L" + pad + " " + (h - pad) + " Z";
    var dots = pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="#8a6f50" stroke="#fff" stroke-width="2"/>'; }).join("");
    var labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
    var xlabels = pts.map(function (p, i) { return '<text x="' + p[0].toFixed(1) + '" y="' + (h - 1) + '" font-size="10" fill="#9a8a76" text-anchor="middle">' + labels[i] + "</text>"; }).join("");

    $("#lineChart").innerHTML =
      '<svg viewBox="0 0 ' + w + " " + (h + 4) + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#b1926c" stop-opacity="0.35"/>' +
      '<stop offset="100%" stop-color="#b1926c" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#g)"/>' +
      '<path d="' + line + '" fill="none" stroke="#8a6f50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots + xlabels + "</svg>";
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  var rendered = { appointments: false, clients: false, treatments: false, reviews: false, enquiries: false, content: false, images: false };
  function ensureRendered(view) {
    if (view === "appointments" && !rendered.appointments) { renderAppointments("all"); rendered.appointments = true; }
    if (view === "clients" && !rendered.clients) { renderClients(); rendered.clients = true; }
    if (view === "treatments" && !rendered.treatments) { renderTreatments(); rendered.treatments = true; }
    if (view === "reviews" && !rendered.reviews) { renderReviews(); rendered.reviews = true; }
    if (view === "content" && !rendered.content) { renderContentEditor(); rendered.content = true; }
    if (view === "images" && !rendered.images) { renderImageEditor(); rendered.images = true; }
    if (view === "enquiries") { renderEnquiries(); }
  }

  function switchView(view) {
    $$(".view").forEach(function (v) { v.classList.toggle("is-active", v.getAttribute("data-view") === view); });
    $$(".nav-link[data-view]").forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("data-view") === view); });
    ensureRendered(view);
    closeSidebar();
    window.scrollTo(0, 0);
  }

  $$(".nav-link[data-view]").forEach(function (link) {
    link.addEventListener("click", function (e) { e.preventDefault(); switchView(link.getAttribute("data-view")); });
  });
  $$("[data-jump]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); switchView(el.getAttribute("data-jump")); });
  });

  /* Appointment filter chips */
  $$(".chip[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip[data-filter]").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      renderAppointments(chip.getAttribute("data-filter"));
    });
  });

  /* Sidebar (mobile) */
  var sidebar = $("#sidebar"), backdrop = $("#backdrop");
  function closeSidebar() { sidebar.classList.remove("is-open"); backdrop.classList.remove("is-open"); }
  $("#menuToggle").addEventListener("click", function () {
    sidebar.classList.toggle("is-open"); backdrop.classList.toggle("is-open");
  });
  backdrop.addEventListener("click", closeSidebar);

  /* Content editor save / reset */
  $("#saveContent").addEventListener("click", saveContent);
  $("#resetContent").addEventListener("click", function () {
    try { localStorage.removeItem("lumiere_content"); } catch (e) {}
    renderContentEditor();
    var toast = $("#saveToast");
    toast.textContent = "✓ Content reset to the original text.";
    toast.hidden = false;
    setTimeout(function () { toast.hidden = true; toast.textContent = "✓ Content saved — refresh your website tab to see it live."; }, 4000);
  });

  /* Logout */
  $("#logout").addEventListener("click", function (e) {
    e.preventDefault();
    fetch("/api/logout", { method: "POST" }).finally(function () {
      window.location.href = "login.html";
    });
  });

  /* ============================================================
     INIT — dashboard is default view
     ============================================================ */
  renderDashboardLists();
  renderBarChart();
  renderLineChart();
  renderEnquiries(); // populates the enquiry counter badge on load
})();
