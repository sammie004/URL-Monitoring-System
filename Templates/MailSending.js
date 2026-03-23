const generateOtpEmail = (name, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email – PulseWatch</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
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
            <td style="padding: 44px 48px 36px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="
                      font-family:'Playfair Display',Georgia,serif;
                      font-size:22px;
                      font-weight:600;
                      color:#f0e6d0;
                      letter-spacing:0.5px;
                    ">PulseWatch</span>
                  </td>
                  <td align="right" style="
                    font-family:'DM Sans',sans-serif;
                    font-size:11px;
                    font-weight:500;
                    letter-spacing:2.5px;
                    text-transform:uppercase;
                    color:rgba(255,255,255,0.25);
                  ">URL Monitoring</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 48px 48px 40px;">

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
                margin-bottom:28px;
              ">Email Verification</div>

              <h2 style="
                margin:0 0 16px;
                font-family:'Playfair Display',Georgia,serif;
                font-size:32px;
                font-weight:600;
                color:#f5efe4;
                line-height:1.2;
                letter-spacing:-0.3px;
              ">One step away,<br/>${name}.</h2>

              <p style="
                margin:0 0 40px;
                font-family:'DM Sans',sans-serif;
                font-size:15px;
                font-weight:300;
                color:rgba(255,255,255,0.45);
                line-height:1.7;
              ">
                Enter the code below to verify your email address and complete your account setup.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="
                      background: linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.04));
                      border: 1px solid rgba(201,169,110,0.3);
                      border-radius: 16px;
                      padding: 32px 48px;
                      display: inline-block;
                    ">
                      <div style="
                        font-family:'DM Sans',sans-serif;
                        font-size:11px;
                        font-weight:500;
                        letter-spacing:3px;
                        text-transform:uppercase;
                        color:rgba(201,169,110,0.6);
                        margin-bottom:16px;
                        text-align:center;
                      ">Your Code</div>

                      <div style="
                        font-family:'Playfair Display',Georgia,serif;
                        font-size:48px;
                        font-weight:600;
                        letter-spacing:14px;
                        color:#f0e6d0;
                        text-align:center;
                        line-height:1;
                        padding-left:14px;
                      ">${otp}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="
                margin:32px 0 0;
                font-family:'DM Sans',sans-serif;
                font-size:13px;
                color:rgba(255,255,255,0.3);
                text-align:center;
                line-height:1.6;
              ">
                Expires in <span style="color:rgba(201,169,110,0.7);">10 minutes</span> &nbsp;·&nbsp; Didn't request this? Safely ignore it.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 24px 48px;
              border-top: 1px solid rgba(255,255,255,0.05);
              background: rgba(0,0,0,0.2);
            ">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(255,255,255,0.18);font-weight:300;">
                    © ${new Date().getFullYear()} PulseWatch. All rights reserved.
                  </td>
                  <td align="right" style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;">
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


const generateWelcomeEmail = (name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to PulseWatch</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#060810;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060810;padding:40px 20px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="
          background:#060810;
          border-radius:4px;
          border:1px solid rgba(255,255,255,0.06);
          overflow:hidden;
        ">

          <!-- TOP BAR -->
          <tr>
            <td style="background:#0a0d14;padding:16px 40px;border-bottom:1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:rgba(255,255,255,0.2);letter-spacing:3px;text-transform:uppercase;">
                    PULSEWATCH.IO
                  </td>
                  <td align="right">
                    <span style="
                      font-family:'DM Mono',monospace;
                      font-size:10px;
                      color:#c9a96e;
                      letter-spacing:2px;
                      background:rgba(201,169,110,0.08);
                      border:1px solid rgba(201,169,110,0.2);
                      padding:3px 10px;
                      border-radius:2px;
                    ">● SYSTEM ACTIVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO — full bleed dark with diagonal accent -->
          <tr>
            <td style="
              padding:0;
              background: linear-gradient(170deg, #0d1117 55%, #0a1628 100%);
              position:relative;
            ">
              <!-- Diagonal rule simulation via nested table -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left panel — big type -->
                  <td style="padding:52px 0 52px 40px;vertical-align:top;width:68%;">

                    <div style="
                      font-family:'DM Mono',monospace;
                      font-size:10px;
                      color:rgba(201,169,110,0.5);
                      letter-spacing:3px;
                      text-transform:uppercase;
                      margin-bottom:20px;
                    ">// NEW_USER_ONBOARDED</div>

                    <div style="
                      font-family:'Bebas Neue',Impact,sans-serif;
                      font-size:72px;
                      line-height:0.9;
                      color:#ffffff;
                      letter-spacing:2px;
                      margin-bottom:4px;
                    ">WELCOME</div>

                    <div style="
                      font-family:'Bebas Neue',Impact,sans-serif;
                      font-size:72px;
                      line-height:0.9;
                      letter-spacing:2px;
                      margin-bottom:32px;
                      background:linear-gradient(90deg,#c9a96e,#e8c98a);
                      -webkit-background-clip:text;
                      -webkit-text-fill-color:transparent;
                      color:#c9a96e;
                    ">${name.toUpperCase()}.</div>

                    <div style="
                      width:40px;height:2px;
                      background:linear-gradient(90deg,#c9a96e,transparent);
                      margin-bottom:20px;
                    "></div>

                    <p style="
                      font-family:'DM Sans',sans-serif;
                      font-size:14px;
                      font-weight:300;
                      color:rgba(255,255,255,0.4);
                      line-height:1.7;
                      margin:0;
                      max-width:280px;
                    ">Your monitoring station is live. Every URL you care about, watched around the clock.</p>

                  </td>

                  <!-- Right panel — stat block -->
                  <td style="padding:52px 40px 52px 0;vertical-align:top;width:32%;">
                    <div style="
                      border:1px solid rgba(255,255,255,0.06);
                      border-radius:4px;
                      overflow:hidden;
                    ">
                      <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);">
                        <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">UPTIME</div>
                        <div style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;color:#34d399;letter-spacing:1px;">99.9%</div>
                      </div>
                      <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);">
                        <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">CHECK INTERVAL</div>
                        <div style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;color:#f0e6d0;letter-spacing:1px;">1 MIN</div>
                      </div>
                      <div style="padding:14px 16px;background:rgba(255,255,255,0.02);">
                        <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">ALERTS</div>
                        <div style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;color:#c9a96e;letter-spacing:1px;">LIVE</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER LINE -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="height:2px;background:#c9a96e;"></td>
                  <td width="33%" style="height:2px;background:rgba(201,169,110,0.3);"></td>
                  <td width="34%" style="height:2px;background:rgba(201,169,110,0.08);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MISSION BRIEFING — feature grid -->
          <tr>
            <td style="padding:40px 40px 36px;background:#07090f;">

              <div style="
                font-family:'DM Mono',monospace;
                font-size:9px;
                color:rgba(255,255,255,0.18);
                letter-spacing:3px;
                text-transform:uppercase;
                margin-bottom:24px;
              ">// CAPABILITIES UNLOCKED</div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <td width="33%" style="padding-right:8px;vertical-align:top;">
                    <div style="border:1px solid rgba(255,255,255,0.05);border-top:2px solid #c9a96e;padding:18px 16px;background:rgba(255,255,255,0.015);">
                      <div style="font-family:'DM Mono',monospace;font-size:9px;color:#c9a96e;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">01 / MONITOR</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Live Uptime</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.25);line-height:1.5;">HTTP checks every minute, zero blind spots.</div>
                    </div>
                  </td>

                  <td width="33%" style="padding-right:8px;vertical-align:top;">
                    <div style="border:1px solid rgba(255,255,255,0.05);border-top:2px solid rgba(201,169,110,0.5);padding:18px 16px;background:rgba(255,255,255,0.015);">
                      <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(201,169,110,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">02 / ALERT</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Instant Alerts</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.25);line-height:1.5;">Email the moment a status changes.</div>
                    </div>
                  </td>

                  <td width="33%" style="vertical-align:top;">
                    <div style="border:1px solid rgba(255,255,255,0.05);border-top:2px solid rgba(201,169,110,0.2);padding:18px 16px;background:rgba(255,255,255,0.015);">
                      <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(201,169,110,0.35);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">03 / ANALYZE</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Analytics</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.25);line-height:1.5;">Response times, history, full diagnostics.</div>
                    </div>
                  </td>

                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA ROW -->
          <tr>
            <td style="padding:0 40px 48px;background:#07090f;">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <p style="
                      margin:0;
                      font-family:'DM Sans',sans-serif;
                      font-size:14px;
                      font-weight:300;
                      color:rgba(255,255,255,0.28);
                      line-height:1.6;
                    ">Add your first URL.<br/>We start watching immediately.</p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="
                          background:linear-gradient(135deg,#c9a96e,#e8c98a);
                          border-radius:3px;
                          box-shadow:0 0 30px rgba(201,169,110,0.2);
                        ">
                          <a href="#" style="
                            display:inline-block;
                            padding:14px 28px;
                            font-family:'DM Mono',monospace;
                            font-size:12px;
                            font-weight:500;
                            letter-spacing:2px;
                            text-transform:uppercase;
                            color:#060810;
                            text-decoration:none;
                          ">LAUNCH DASHBOARD →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="
              padding:18px 40px;
              background:#04060a;
              border-top:1px solid rgba(255,255,255,0.04);
            ">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,0.12);letter-spacing:1px;">
                    © ${new Date().getFullYear()} PULSEWATCH — ALL RIGHTS RESERVED
                  </td>
                  <td align="right">
                    <a href="#" style="font-family:'DM Mono',monospace;font-size:10px;color:rgba(201,169,110,0.3);text-decoration:none;letter-spacing:1px;margin-left:16px;">UNSUBSCRIBE</a>
                    <a href="#" style="font-family:'DM Mono',monospace;font-size:10px;color:rgba(201,169,110,0.3);text-decoration:none;letter-spacing:1px;margin-left:16px;">PRIVACY</a>
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

module.exports = {
  generateOtpEmail,
  generateWelcomeEmail
};
