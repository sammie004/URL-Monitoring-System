const generateDownAlertEmail = (name, url) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Service Down Alert – PulseWatch</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:48px 20px;">
    <tr>
      <td align="center">

        <table width="580" cellpadding="0" cellspacing="0" style="
          background: linear-gradient(160deg, #1a0d0d 0%, #0d1422 100%);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
        ">

          <!-- Header -->
          <tr>
            <td style="padding: 36px 48px 28px; border-bottom: 1px solid rgba(255,255,255,0.06);">
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
            <td style="padding: 44px 48px 0;">

              <!-- Status badge -->
              <div style="
                display:inline-block;
                background:rgba(239,68,68,0.12);
                border:1px solid rgba(239,68,68,0.3);
                border-radius:20px;
                padding:5px 14px;
                font-family:'DM Sans',sans-serif;
                font-size:11px;
                font-weight:500;
                letter-spacing:2px;
                text-transform:uppercase;
                color:#f87171;
                margin-bottom:24px;
              ">● Service Down</div>

              <!-- Headline -->
              <h1 style="
                margin:0 0 16px;
                font-family:'Playfair Display',Georgia,serif;
                font-size:36px;
                font-weight:600;
                color:#f5efe4;
                line-height:1.15;
                letter-spacing:-0.5px;
              ">Heads up,<br/><em style="color:#f87171;font-style:italic;">${name}.</em></h1>

              <p style="
                margin:0 0 36px;
                font-family:'DM Sans',sans-serif;
                font-size:15px;
                font-weight:300;
                color:rgba(255,255,255,0.4);
                line-height:1.7;
                max-width:420px;
              ">
                One of your monitored services is not responding. Immediate attention may be required.
              </p>

            </td>
          </tr>

          <!-- URL card -->
          <tr>
            <td style="padding: 0 48px 40px;">
              <div style="
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:14px;
                padding:24px 28px;
                position:relative;
                overflow:hidden;
              ">
                <!-- Red accent line -->
                <div style="
                  position:absolute;
                  top:0;left:0;
                  width:3px;height:100%;
                  background:linear-gradient(180deg,#ef4444,#dc2626);
                  border-radius:3px 0 0 3px;
                "></div>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                      <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:8px;">Affected URL</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:#f0e6d0;word-break:break-all;">${url}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:16px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%">
                            <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:6px;">Status</div>
                            <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#f87171;">● Unreachable</div>
                          </td>
                          <td width="50%">
                            <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:6px;">Detected at</div>
                            <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;color:rgba(255,255,255,0.55);">${new Date().toLocaleString()}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td style="padding: 0 48px 44px;">

              <p style="
                margin:0 0 28px;
                font-family:'DM Sans',sans-serif;
                font-size:14px;
                font-weight:300;
                color:rgba(255,255,255,0.35);
                line-height:1.7;
              ">
                We recommend checking your server, hosting provider, or network configuration. PulseWatch will notify you as soon as the service recovers.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background:linear-gradient(135deg,#ef4444,#dc2626);
                    border-radius:9px;
                    box-shadow:0 6px 20px rgba(239,68,68,0.25);
                  ">
                    <a href="${url}" style="
                      display:inline-block;
                      padding:13px 28px;
                      font-family:'DM Sans',sans-serif;
                      font-size:13px;
                      font-weight:500;
                      letter-spacing:0.3px;
                      color:#ffffff;
                      text-decoration:none;
                    ">Check Website →</a>
                  </td>
                </tr>
              </table>

              <!-- Sign off -->
              <p style="
                margin:32px 0 0;
                font-family:'Playfair Display',Georgia,serif;
                font-size:13px;
                font-style:italic;
                color:rgba(255,255,255,0.18);
                line-height:1.6;
              ">Watching closely,<br/><span style="color:rgba(248,113,113,0.45);">The PulseWatch Team</span></p>

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
                    <a href="#" style="color:rgba(248,113,113,0.4);text-decoration:none;">Unsubscribe</a>
                    &nbsp;·&nbsp;
                    <a href="#" style="color:rgba(248,113,113,0.4);text-decoration:none;">Privacy</a>
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

module.exports = { generateDownAlertEmail };