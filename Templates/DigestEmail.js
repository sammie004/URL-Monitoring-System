const generateDigestEmail = (name, changes) => {
  // changes: Array<{ url, previousStatusCode, newStatusCode, newStatus, reason }>

  const total     = changes.length;
  const downCount = changes.filter(c => c.newStatus === "down").length;
  const upCount   = changes.filter(c => c.newStatus === "up").length;

  const subjectSuffix = downCount > 0
    ? `${downCount} service${downCount > 1 ? "s" : ""} down`
    : `${upCount} service${upCount > 1 ? "s" : ""} recovered`;

  const rows = changes.map(c => {
    const isDown       = c.newStatus === "down";
    const isFirstCheck = c.reason === "first_check";

    const dotColor   = isDown ? "#f87171" : "#34d399";
    const labelColor = isDown ? "rgba(248,113,113,0.7)" : "rgba(52,211,153,0.7)";
    const label      = isFirstCheck
      ? `First check — ${c.newStatus.toUpperCase()} (${c.newStatusCode})`
      : isDown
        ? `DOWN (${c.previousStatusCode} → ${c.newStatusCode})`
        : `Recovered (${c.previousStatusCode} → ${c.newStatusCode})`;

    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="
                  font-family:'DM Sans',sans-serif;
                  font-size:13px;
                  font-weight:400;
                  color:#f0e6d0;
                  word-break:break-all;
                  margin-bottom:5px;
                ">${c.url}</div>
                <div style="
                  font-family:'DM Sans',sans-serif;
                  font-size:11px;
                  font-weight:500;
                  letter-spacing:0.5px;
                  color:${labelColor};
                ">● ${label}</div>
              </td>
              <td align="right" width="28">
                <div style="
                  width:10px;height:10px;
                  background:${dotColor};
                  border-radius:50%;
                  display:inline-block;
                  box-shadow:0 0 8px ${dotColor};
                "></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join("");

  // Summary bar
  const summaryItems = [];
  if (downCount > 0) summaryItems.push(`<span style="color:#f87171;font-weight:500;">${downCount} down</span>`);
  if (upCount   > 0) summaryItems.push(`<span style="color:#34d399;font-weight:500;">${upCount} recovered</span>`);
  const summaryBar = summaryItems.join(`<span style="color:rgba(255,255,255,0.2);"> &nbsp;·&nbsp; </span>`);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Monitoring Digest – PulseWatch</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:48px 20px;">
    <tr>
      <td align="center">

        <table width="580" cellpadding="0" cellspacing="0" style="
          background: linear-gradient(160deg, #131929 0%, #0d1422 100%);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
        ">

          <!-- Header -->
          <tr>
            <td style="padding:36px 48px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;color:#f0e6d0;letter-spacing:0.3px;">
                    PulseWatch
                  </td>
                  <td align="right" style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.22);">
                    URL Monitoring
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:44px 48px 0;">

              <div style="
                display:inline-block;
                background:rgba(201,169,110,0.12);
                border:1px solid rgba(201,169,110,0.25);
                border-radius:20px;
                padding:5px 14px;
                font-family:'DM Sans',sans-serif;
                font-size:11px;
                font-weight:500;
                letter-spacing:2px;
                text-transform:uppercase;
                color:#c9a96e;
                margin-bottom:24px;
              ">Monitoring Digest</div>

              <h1 style="
                margin:0 0 16px;
                font-family:'Playfair Display',Georgia,serif;
                font-size:34px;
                font-weight:600;
                color:#f5efe4;
                line-height:1.15;
                letter-spacing:-0.5px;
              ">${total} update${total > 1 ? "s" : ""} for you,<br/><em style="color:#c9a96e;font-style:italic;">${name}.</em></h1>

              <p style="
                margin:0 0 12px;
                font-family:'DM Sans',sans-serif;
                font-size:15px;
                font-weight:300;
                color:rgba(255,255,255,0.4);
                line-height:1.7;
              ">
                Here's what changed across your monitored URLs in the latest check.
              </p>

              <!-- Summary bar -->
              <p style="
                margin:0 0 36px;
                font-family:'DM Sans',sans-serif;
                font-size:13px;
                font-weight:300;
              ">${summaryBar}</p>

            </td>
          </tr>

          <!-- URL change rows -->
          <tr>
            <td style="padding:0 48px 40px;">
              <div style="
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:14px;
                padding:0 24px;
              ">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                </table>
              </div>
            </td>
          </tr>

          <!-- Body copy + CTA -->
          <tr>
            <td style="padding:0 48px 44px;">
              <p style="
                margin:0 0 28px;
                font-family:'DM Sans',sans-serif;
                font-size:14px;
                font-weight:300;
                color:rgba(255,255,255,0.35);
                line-height:1.7;
              ">
                PulseWatch will continue monitoring all your URLs and alert you as soon as anything else changes.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background:linear-gradient(135deg,#c9a96e,#e8c98a);
                    border-radius:9px;
                    box-shadow:0 6px 20px rgba(201,169,110,0.28);
                  ">
                    <a href="#" style="
                      display:inline-block;
                      padding:13px 28px;
                      font-family:'DM Sans',sans-serif;
                      font-size:13px;
                      font-weight:500;
                      letter-spacing:0.3px;
                      color:#0d1422;
                      text-decoration:none;
                    ">View Dashboard →</a>
                  </td>
                </tr>
              </table>

              <p style="
                margin:32px 0 0;
                font-family:'Playfair Display',Georgia,serif;
                font-size:13px;
                font-style:italic;
                color:rgba(255,255,255,0.18);
                line-height:1.6;
              ">Watching closely,<br/><span style="color:rgba(201,169,110,0.5);">The PulseWatch Team</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:20px 48px;
              border-top:1px solid rgba(255,255,255,0.05);
              background:rgba(0,0,0,0.2);
            ">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(255,255,255,0.16);font-weight:300;">
                    © ${new Date().getFullYear()} PulseWatch. All rights reserved.
                  </td>
                  <td align="right" style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;">
                    <a href="#" style="color:rgba(201,169,110,0.5);text-decoration:none;">Unsubscribe</a>
                    &nbsp;·&nbsp;
                    <a href="#" style="color:rgba(201,169,110,0.5);text-decoration:none;">Privacy</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

module.exports = { generateDigestEmail };