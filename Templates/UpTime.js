const generateRecoveryEmail = (name, url) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2a9d8f;">✅ Website Back Online</h2>

      <p>Hello ${name},</p>

      <p>Good news! Your monitored URL is now <strong style="color:green;">UP</strong>.</p>

      <div style="background:#f8f9fa; padding:15px; border-radius:8px;">
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Status:</strong> Reachable</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p>Your service has recovered successfully 🎉</p>

      <br/>

      <p style="font-size: 12px; color: gray;">
        This alert was generated automatically by your monitoring system.
      </p>
    </div>
  `;
};
module.exports = {
  generateRecoveryEmail
}