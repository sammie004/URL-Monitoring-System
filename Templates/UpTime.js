const generateRecoveryEmail = (name, url) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Service Recovered – PulseWatch</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:48px 20px;">
    <tr>
      <td align="center">

        <table width="580" cellpadding="0" cellspacing="0" style="
          background:linear-gradient(160deg,#111d16 0%,#0d1a13 100%);
          border-radius:20px;
          border:1px solid rgba(255,255,255,0.07);
          overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.03);
        ">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="
                      font-family:'Playfair Display',Georgia,serif;
                      font-size:20px;font-weight:600;
                      color:#f0e6d0;letter-spacing:0.3px;
                    ">PulseWatch</span>
                  </td>
                  <td align="right" style="
                    font-family:'DM Sans',sans-serif;
                    font-size:10px;font-weight:500;
                    letter-spacing:2.5px;text-transform:uppercase;
                    color:rgba(255,255,255,0.22);
                  ">URL Monitoring</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="
              padding:44px 40px 36px;
              background:linear-gradient(160deg,#0d2318 0%,#0d1a13 100%);
              border-bottom:1px solid rgba(255,255,255,0.06);
            ">

              <!-- Status pill -->
              <div style="margin-bottom:28px;">
                <span style="
                  display:inline-block;
                  background:rgba(52,211,153,0.12);
                  border:1px solid rgba(52,211,153,0.3);
                  border-radius:20px;padding:5px 14px;
                  font-family:'DM Sans',sans-serif;
                  font-size:10px;font-weight:500;
                  letter-spacing:2px;text-transform:uppercase;
                  color:#34d399;
                ">Service Recovered</span>
              </div>

              <!-- Headline -->
              <h1 style="
                margin:0 0 16px;
                font-family:'Playfair Display',Georgia,serif;
                font-size:36px;font-weight:600;
                color:#f5efe4;line-height:1.15;letter-spacing:-0.5px;
              ">Back online,<br/><em style="color:#34d399;font-style:italic;">all clear.</em></h1>

              <p style="
                margin:0;
                font-family:'DM Sans',sans-serif;
                font-size:15px;font-weight:300;
                color:rgba(255,255,255,0.4);line-height:1.7;
              ">Hi <strong style="color:rgba(255,255,255,0.65);font-weight:500;">${name}</strong> — your monitored service has fully recovered and is responding normally.</p>
            </td>
          </tr>

          <!-- URL Details card -->
          <tr>
            <td style="padding:36px 40px 28px;">

              <div style="
                background:rgba(52,211,153,0.05);
                border:1px solid rgba(52,211,153,0.18);
                border-radius:14px;
                padding:24px 28px;
                margin-bottom:28px;
              ">

                <!-- Top accent line -->
                <div style="
                  width:40px;height:2px;
                  background:linear-gradient(90deg,#34d399,transparent);
                  border-radius:2px;margin-bottom:20px;
                "></div>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:14px;">
                      <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(52,211,153,0.55);margin-bottom:5px;">URL</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:rgba(255,255,255,0.7);word-break:break-all;">${url}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid rgba(255,255,255,0.05);padding-top:14px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%">
                            <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(52,211,153,0.55);margin-bottom:5px;">Status</div>
                            <div style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#34d399;">● Reachable</div>
                          </td>
                          <td width="50%">
                            <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(52,211,153,0.55);margin-bottom:5px;">Recovered at</div>
                            <div style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:rgba(255,255,255,0.55);">${new Date().toLocaleString()}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="
                margin:0 0 10px;
                font-family:'DM Sans',sans-serif;
                font-size:14px;font-weight:300;
                color:rgba(255,255,255,0.35);line-height:1.7;
              ">PulseWatch will continue monitoring this URL and alert you if anything changes.</p>

              <!-- Sign off -->
              <p style="
                margin:28px 0 0;
                font-family:'Playfair Display',Georgia,serif;
                font-size:14px;font-style:italic;
                color:rgba(255,255,255,0.18);line-height:1.6;
              ">All good,<br/>
              <span style="color:rgba(52,211,153,0.45);">The PulseWatch Team</span></p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:20px 40px;
              border-top:1px solid rgba(255,255,255,0.05);
              background:rgba(0,0,0,0.2);
            ">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(255,255,255,0.16);font-weight:300;">
                    © ${new Date().getFullYear()} PulseWatch. All rights reserved.
                  </td>
                  <td align="right" style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;">
                    <a href="#" style="color:rgba(52,211,153,0.4);text-decoration:none;">Unsubscribe</a>
                    &nbsp;·&nbsp;
                    <a href="#" style="color:rgba(52,211,153,0.4);text-decoration:none;">Privacy</a>
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

module.exports = { generateRecoveryEmail };