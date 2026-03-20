const generateDownAlertEmail = (name, url) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #e63946;">🚨 Website Down Alert</h2>

      <p>Hello ${name},</p>

      <p>Your monitored URL is currently <strong style="color:red;">DOWN</strong>.</p>

      <div style="background:#f8f9fa; padding:15px; border-radius:8px;">
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Status:</strong> Not reachable</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p>Please check your server or hosting provider.</p>

      <br/>

      <p style="font-size: 12px; color: gray;">
        This alert was generated automatically by your monitoring system.
      </p>
    </div>
  `;
};

module.exports = {
  generateDownAlertEmail
}