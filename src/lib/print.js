/**
 * UI-only "download as PDF" helper — opens a printable window and triggers the
 * browser's print dialog (Save as PDF).
 */
export function openPrintable(title, bodyHtml) {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${title}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;margin:32px;line-height:1.5}
    h1{font-size:22px;margin:0 0 4px}
    h2{font-size:15px;margin:22px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px}
    .muted{color:#666;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
    th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    th{background:#f5f5f5}
    ul{margin:6px 0;padding-left:18px;font-size:13px}
    .box{border:1px solid #ddd;border-radius:6px;padding:12px;margin-top:10px;font-size:13px}
    @media print{body{margin:16px}}
  // eslint-disable-next-line no-useless-escape
  </style></head><body>${bodyHtml}<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`);
  w.document.close();
}

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));