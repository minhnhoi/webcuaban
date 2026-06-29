const nodemailer = require('nodemailer');

const port = Number(process.env.SMTP_PORT || 465);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // 465 = SSL, 587 = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  tls: { rejectUnauthorized: false }
});

// Verify khi khởi động để biết sớm nếu sai cấu hình
transporter.verify().then(
  () => console.log('[mail] SMTP ready on', process.env.SMTP_HOST + ':' + port),
  (err) => console.error('[mail] SMTP verify FAILED:', err.message)
);

async function sendOtpMail(toEmail, otp, userName = 'Khách hàng') {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Mã OTP đặt lại mật khẩu',
    html: `
      <div style="background-color:#f3f4f6;padding:50px 0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,.05);border:1px solid #e5e7eb">
          <div style="padding:40px 40px 24px;text-align:center">
            <div style="font-size:14px;color:#6b7280;margin-bottom:32px;text-align:left;font-weight:500">
              Xin chào, <span style="color:#111827;font-weight:600">${userName}</span> 👋
            </div>
            <div style="margin-bottom:24px"><span style="font-size:28px;font-weight:900;color:#2563eb;letter-spacing:-.5px">Crystal War: Blooding Field 2026</span></div>
            <h1 style="font-size:28px;font-weight:800;color:#111827;margin:0">Đặt lại mật khẩu</h1>
          </div>
          <div style="padding:0 40px 40px;color:#4b5563;font-size:15px;line-height:1.6">
            <p style="margin-top:0;text-align:center;color:#6b7280">Hãy sử dụng mã bảo mật dưới đây để xác nhận thay đổi.</p>
            <div style="background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);border-radius:20px;padding:32px 24px;text-align:center;margin:32px 0;border:2px dashed #e2e8f0">
              <span style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#3b82f6;font-weight:700;display:block;margin-bottom:12px">Mã OTP xác thực của bạn</span>
              <div style="font-size:42px;font-weight:800;letter-spacing:8px;color:#1e40af;font-family:Courier New,monospace">${otp}</div>
            </div>
            <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;border-radius:8px;margin-bottom:24px">
              <p style="margin:0;font-size:13.5px;color:#c2410c;font-weight:500">⚠️ Mã này có hiệu lực <strong>10 phút</strong>. Không chia sẻ cho bất kỳ ai.</p>
            </div>
            <p style="margin-top:0;font-size:14px;color:#9ca3af;text-align:center">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          </div>
          <div style="background:#fafafa;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center">
            <p style="font-size:11px;color:#9ca3af;margin:0">Copyright © ${new Date().getFullYear()} Crystal War: Blooding Field 2026.</p>
          </div>
        </div>
      </div>
    `
  });
}

module.exports = { sendOtpMail };
