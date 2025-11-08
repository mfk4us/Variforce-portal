(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Invite banner copy
  try {
    const btnCopy = qs("#btn-copy-invite");
    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        const code = qs("#invite-code");
        const url = code ? code.getAttribute("data-invite") : "";
        if (!url) return;
        try {
          await navigator.clipboard.writeText(url);
          btnCopy.textContent = "Copied!";
          setTimeout(() => (btnCopy.textContent = "Copy Link"), 1500);
        } catch {}
      });
    }
  } catch {}

  // Rows cache for modal
  const rowsBlob = document.getElementById("rows-json");
  let rowsArr = [];
  let rowsMap = {};
  try {
    rowsArr = rowsBlob ? JSON.parse(rowsBlob.textContent || "[]") : [];
    rowsArr.forEach((r) => (rowsMap[r.id] = r));
  } catch {
    rowsArr = [];
    rowsMap = {};
  }

  function light(h) {
    try {
      const el = qs('[data-rowid="' + h + '"]');
      if (el) el.style.background = "rgba(16,185,129,0.10)";
    } catch {}
  }
  function unlight() {
    qsa("[data-rowid]").forEach((el) => (el.style.background = ""));
  }

  // Filter fallback
  function applyFilterFromURL() {
    try {
      const sp = new URLSearchParams(location.search);
      const wanted = (sp.get("status") || "all").toLowerCase();
      const allowed = ["all", "pending", "approved", "rejected"];
      const pick = allowed.includes(wanted) ? wanted : "all";
      const items = qsa("li[data-status]");
      items.forEach((li) => {
        const st = (li.getAttribute("data-status") || "").toLowerCase();
        li.style.display = pick === "all" || st === pick ? "grid" : "none";
      });
    } catch {}
  }

  function setBulkToolbar() {
    const checks = qsa('input[name="row"]').filter((cb) => cb.checked);
    const cnt = checks.length;
    const bar = qs("#bulk-toolbar");
    const countEl = qs("#bulk-count");
    const ids = checks.map((cb) => cb.value).join(",");
    const h1 = qs("#bulk-ids");
    const h2 = qs("#bulk-ids-reject");
    if (h1) h1.value = ids;
    if (h2) h2.value = ids;
    if (countEl) countEl.textContent = String(cnt);
    if (bar) bar.style.display = cnt ? "flex" : "none";

    const master = qs("#chk-all");
    if (master) {
      if (cnt === 0) {
        master.indeterminate = false;
        master.checked = false;
      } else {
        const total = qsa('input[name="row"]').length;
        master.indeterminate = cnt > 0 && cnt < total;
        master.checked = cnt === total;
      }
    }
  }

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === "chk-all") {
      const on = t.checked;
      qsa('input[name="row"]').forEach((cb) => (cb.checked = on));
      setBulkToolbar();
    }
    if (t.name === "row") setBulkToolbar();
  });

  // Modal
  const backdrop = qs("#details-backdrop");
  const modal = qs("#details-modal");
  const titleEl = qs("#details-title");
  const approveBtn = qs("#btn-approve");
  const rejectBtn = qs("#btn-reject");
  const idApprove = qs("#details-id-approve");
  const idReject = qs("#details-id-reject");
  const tabBtns = qsa(".tab-btn");
  const tabDetails = qs("#tab-details");
  const tabCR = qs("#tab-cr");
  const tabVAT = qs("#tab-vat");
  const crFrame = qs("#cr-frame");
  const vatFrame = qs("#vat-frame");
  let openId = null;

  function openModal() {
    if (backdrop) backdrop.style.display = "block";
    if (modal) modal.style.display = "block";
    document.documentElement.style.overflow = "hidden";
  }
  function closeModal() {
    if (backdrop) backdrop.style.display = "none";
    if (modal) modal.style.display = "none";
    document.documentElement.style.overflow = "";
    openId = null;
    unlight();
  }
  function showTab(name) {
    if (!tabDetails || !tabCR || !tabVAT) return;
    tabDetails.style.display = name === "details" ? "block" : "none";
    tabCR.style.display = name === "cr" ? "block" : "none";
    tabVAT.style.display = name === "vat" ? "block" : "none";
    tabBtns.forEach((btn) => {
      if (btn.dataset.tab === name) {
        btn.style.background = "#10b981";
        btn.style.color = "#fff";
      } else {
        btn.style.background = "#fff";
        btn.style.color = "#111827";
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.id === "details-backdrop") closeModal();
  });
  const closeBtn = qs("#btn-close-modal");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  tabBtns.forEach((btn) =>
    btn.addEventListener("click", () => showTab(btn.dataset.tab)),
  );

  // Close modal immediately on submit; server re-renders
  const f1 = qs("#form-approve");
  const f2 = qs("#form-reject");
  if (f1) f1.addEventListener("submit", () => closeModal());
  if (f2) f2.addEventListener("submit", () => closeModal());

  // View buttons (delegated)
  document.addEventListener("click", (e) => {
    const trg = e.target && e.target.closest ? e.target.closest(".btn-view") : null;
    if (!trg) return;
    const rid = trg.getAttribute("data-id");
    const obj = rid ? rowsMap[rid] : null;
    if (!obj) {
      alert("Failed to open details");
      return;
    }
    if (openId && openId === obj.id) {
      closeModal();
      return;
    }
    unlight();
    light(obj.id);
    if (titleEl) titleEl.textContent = obj.company_name || "Application";
    if (idApprove) idApprove.value = obj.id || "";
    if (idReject) idReject.value = obj.id || "";

    const isPending = obj.status === "pending";
    if (approveBtn) approveBtn.style.display = isPending ? "inline-flex" : "none";
    if (rejectBtn) rejectBtn.style.display = isPending ? "inline-flex" : "none";

    const lines = [];
    const span = (k, v) =>
      v
        ? `<div style="margin:4px 0;"><span style="color:#667085;">${k}:</span> <strong>${String(
            v,
          )}</strong></div>`
        : "";
    lines.push(span("Company", obj.company_name));
    lines.push(span("Contact", obj.contact_name));
    lines.push(span("Phone", obj.phone));
    lines.push(span("Email", obj.email));
    lines.push(span("City", obj.city));
    lines.push(span("Industry", obj.industry));
    lines.push(span("Language", obj.lang && String(obj.lang).toUpperCase()));
    if (Object.prototype.hasOwnProperty.call(obj, "want_rate_book"))
      lines.push(span("Wants Rate Book", obj.want_rate_book ? "Yes" : "No"));
    lines.push(span("CR Number", obj.cr_number));
    lines.push(span("VAT Number", obj.vat_number));
    lines.push(span("Status", obj.status));
    lines.push(span("Submitted At", obj.submitted_at));
    lines.push(span("Reviewed At", obj.reviewed_at));
    lines.push(span("Reviewer ID", obj.reviewer_id));
    if (tabDetails) tabDetails.innerHTML = lines.join("");

    const hasCR = !!obj.cr_href;
    const hasVAT = !!obj.vat_href;
    const tabCRBtn = qsa(".tab-btn").find((b) => b.dataset.tab === "cr");
    const tabVATBtn = qsa(".tab-btn").find((b) => b.dataset.tab === "vat");
    if (tabCRBtn) tabCRBtn.style.display = hasCR ? "inline-flex" : "none";
    if (tabVATBtn) tabVATBtn.style.display = hasVAT ? "inline-flex" : "none";
    if (crFrame) crFrame.src = hasCR ? obj.cr_href : "about:blank";
    if (vatFrame) vatFrame.src = hasVAT ? obj.vat_href : "about:blank";

    showTab("details");
    openId = obj.id || null;
    openModal();
  });

  // Defer filter to avoid hydration mismatch
  window.addEventListener("load", () => {
    requestAnimationFrame(() => setTimeout(applyFilterFromURL, 0));
  });
  window.addEventListener("popstate", () => {
    requestAnimationFrame(() => setTimeout(applyFilterFromURL, 0));
  });
})();