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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to PulseWatch</title>
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

          <!-- Hero Header -->
          <tr>
            <td style="
              padding: 56px 48px 48px;
              background: linear-gradient(160deg, #0f1e2e 0%, #0d1422 100%);
              border-bottom: 1px solid rgba(255,255,255,0.06);
            ">
              <div style="margin-bottom:36px;">
                <span style="
                  font-family:'DM Sans',sans-serif;
                  font-size:11px;
                  font-weight:500;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  color:rgba(255,255,255,0.25);
                ">PulseWatch</span>
              </div>

              <h1 style="
                margin:0 0 16px;
                font-family:'Playfair Display',Georgia,serif;
                font-size:42px;
                font-weight:600;
                color:#f5efe4;
                line-height:1.15;
                letter-spacing:-0.5px;
              ">Welcome aboard,<br/><em style="color:#c9a96e;font-style:italic;">${name}.</em></h1>

              <p style="
                margin:0;
                font-family:'DM Sans',sans-serif;
                font-size:15px;
                font-weight:300;
                color:rgba(255,255,255,0.4);
                line-height:1.7;
                max-width:400px;
              ">Your account is live. PulseWatch is ready to keep a vigilant eye on everything you care about.</p>
            </td>
          </tr>

          <!-- Feature tiles -->
          <tr>
            <td style="padding: 40px 48px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding-right:10px;vertical-align:top;">
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 18px;">
                      <div style="font-size:22px;margin-bottom:10px;">📡</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Live Uptime</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);line-height:1.5;">Monitor any URL in real-time, around the clock.</div>
                    </div>
                  </td>
                  <td width="33%" style="padding-right:10px;vertical-align:top;">
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 18px;">
                      <div style="font-size:22px;margin-bottom:10px;">⚡</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Instant Alerts</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);line-height:1.5;">Get notified the moment something goes down.</div>
                    </div>
                  </td>
                  <td width="33%" style="vertical-align:top;">
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 18px;">
                      <div style="font-size:22px;margin-bottom:10px;">📊</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:6px;">Analytics</div>
                      <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);line-height:1.5;">Deep performance insights and historical data.</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 48px 48px;">
              <p style="
                margin:0 0 28px;
                font-family:'DM Sans',sans-serif;
                font-size:15px;
                font-weight:300;
                color:rgba(255,255,255,0.4);
                line-height:1.7;
              ">
                Add your first URL and we'll begin monitoring it instantly — no setup required.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background: linear-gradient(135deg, #c9a96e, #e8c98a);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(201,169,110,0.3);
                  ">
                    <a href="#" style="
                      display:inline-block;
                      padding: 15px 32px;
                      font-family:'DM Sans',sans-serif;
                      font-size:14px;
                      font-weight:500;
                      letter-spacing:0.5px;
                      color:#0d1422;
                      text-decoration:none;
                    ">Open your Dashboard →</a>
                  </td>
                </tr>
              </table>

              <p style="
                margin:36px 0 0;
                font-family:'Playfair Display',Georgia,serif;
                font-size:14px;
                font-style:italic;
                color:rgba(255,255,255,0.2);
              ">Happy monitoring,<br/>
              <span style="color:rgba(201,169,110,0.5);">The PulseWatch Team</span></p>
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


module.exports = {
  generateOtpEmail,
  generateWelcomeEmail
};
