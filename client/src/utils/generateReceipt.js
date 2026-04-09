/**
 * Prints a compact 1/4 A4 (A6) receipt using a hidden iframe.
 */
export function generateReceipt(appointment) {
  const {
    guestName,
    guestPhone,
    guestEmail,
    packageName,
    packagePrice,
    date,
    timeSlot,
    status,
    _id,
  } = appointment;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year:    'numeric',
    month:   'short',
    day:     'numeric',
  });

  const formattedPrice = packagePrice == null
    ? 'N/A'
    : 'LKR ' + Number(packagePrice).toLocaleString('en-LK');

  const printedAt = new Date().toLocaleString('en-US', {
    year:   '2-digit',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });

  const receiptId = String(_id).slice(-8).toUpperCase();
  const emailRow = guestEmail
    ? '<div class="row"><span class="lbl">Email</span><span class="val">' + guestEmail + '</span></div>'
    : '';

  const html = '<!DOCTYPE html>'
    + '<html lang="en"><head><meta charset="UTF-8"/>'
    + '<title>Receipt - Salon DECO</title>'
    + '<style>'
    + '@page{size:105mm 148.5mm;margin:0}'
    + '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:Segoe UI,Arial,sans-serif;background:#fff;color:#1a1a1a;width:105mm;min-height:148.5mm;padding:6mm 7mm 5mm;font-size:8.5pt;line-height:1.35}'
    + '.header{text-align:center;border-bottom:1px solid #c9a84c;padding-bottom:4mm;margin-bottom:3.5mm}'
    + '.logo-row{display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:1.5mm}'
    + '.scissors{font-size:13pt;color:#c9a84c}'
    + '.sname{font-size:15pt;font-weight:700;letter-spacing:1.5px;color:#1a1a1a}'
    + '.sname span{color:#c9a84c}'
    + '.addr{font-size:7pt;color:#777;margin-top:1mm}'
    + '.rtitle{font-size:6.5pt;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#999;margin-top:2.5mm}'
    + '.badge{display:inline-block;padding:1px 8px;border-radius:10px;font-size:6.5pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;margin-top:1.5mm}'
    + '.ref{text-align:center;font-size:6.5pt;color:#bbb;letter-spacing:1px;margin-bottom:3mm}'
    + '.sec{font-size:6pt;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;margin-bottom:1.5mm;margin-top:3mm}'
    + '.row{display:flex;justify-content:space-between;align-items:baseline;padding:1.5mm 0;border-bottom:1px dashed #ebebeb;font-size:8pt}'
    + '.row:last-child{border-bottom:none}'
    + '.lbl{color:#888;flex-shrink:0;margin-right:3mm;white-space:nowrap}'
    + '.val{color:#1a1a1a;font-weight:600;text-align:right;word-break:break-word}'
    + '.total{background:#fdf8ee;border:1px solid #e8d89a;border-radius:4px;padding:2.5mm 3.5mm;display:flex;justify-content:space-between;align-items:center;margin-top:3mm}'
    + '.tlbl{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888}'
    + '.tval{font-size:13pt;font-weight:700;color:#c9a84c}'
    + '.footer{text-align:center;margin-top:3.5mm;padding-top:3mm;border-top:1px solid #eee}'
    + '.ty{font-size:8pt;font-weight:700;color:#1a1a1a}'
    + '.sub{font-size:6.5pt;color:#aaa;margin-top:0.5mm}'
    + '.info{font-size:6pt;color:#999;margin-top:1.5mm}'
    + '.printed{text-align:center;font-size:6pt;color:#ccc;margin-top:2.5mm}'
    + '</style></head><body>'
    + '<div class="header">'
    + '<div class="logo-row"><span class="scissors">&#9986;</span><span class="sname">Salon <span>DECO</span></span></div>'
    + '<div class="addr">Puwakdandawa, Beliatta, Sri Lanka &nbsp;|&nbsp; 076 715 7718</div>'
    + '<div class="rtitle">Appointment Receipt</div><br/>'
    + '<div class="badge">' + status + '</div>'
    + '</div>'
    + '<div class="ref">REF # ' + receiptId + '</div>'
    + '<div class="sec">Customer</div>'
    + '<div class="row"><span class="lbl">Name</span><span class="val">' + (guestName || '-') + '</span></div>'
    + '<div class="row"><span class="lbl">Phone</span><span class="val">' + (guestPhone || '-') + '</span></div>'
    + emailRow
    + '<div class="sec">Appointment</div>'
    + '<div class="row"><span class="lbl">Package</span><span class="val">' + packageName + '</span></div>'
    + '<div class="row"><span class="lbl">Date</span><span class="val">' + formattedDate + '</span></div>'
    + '<div class="row"><span class="lbl">Time</span><span class="val">' + timeSlot + '</span></div>'
    + '<div class="total"><span class="tlbl">Total</span><span class="tval">' + formattedPrice + '</span></div>'
    + '<div class="footer">'
    + '<div class="ty">Thank you for choosing Salon DECO!</div>'
    + '<div class="sub">We look forward to seeing you again.</div>'
    + '<div class="info">contact.salondeco@gmail.com &nbsp;|&nbsp; fb.com/salonthedeco</div>'
    + '</div>'
    + '<div class="printed">Printed ' + printedAt + '</div>'
    + '</body></html>';

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open();
  iDoc.close();
  iframe.contentDocument.documentElement.innerHTML = html;

  iframe.contentWindow.onafterprint = () => { iframe.remove(); };

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 300);
}
