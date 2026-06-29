import { useEffect, useRef, useState } from 'react';
import { api, API_BASE } from '../lib/api.js';

export default function ForgotPasswordModal({ open, email, onClose }) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState({ text: '', cls: '' });
  const [msg2, setMsg2] = useState({ text: '', cls: '' });
  const [countdown, setCountdown] = useState(0);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const inputsRef = useRef([]);
  const sentRef = useRef(false);

  useEffect(() => {
    if (open) {
      setStep(1); setOtp(['', '', '', '', '', '']);
      setMsg({ text: '', cls: '' }); setMsg2({ text: '', cls: '' });
      setPassword(''); setConfirm(''); setVerifiedOtp('');
      sentRef.current = false;
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
      sendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function sendOtp() {
    if (sentRef.current && countdown > 0) return;
    sentRef.current = true;
    setMsg({ text: 'Đang gửi OTP...', cls: '' });
    try {
      const data = await api('/auth/send-otp', { method: 'POST', body: { email } });
      setMsg({ text: data.message || 'OTP đã gửi', cls: 'ok' });
      setCountdown(data.cooldown || 60);
    } catch (err) {
      setMsg({ text: err.message, cls: 'error' });
      if (err.data && err.data.retryAfter) setCountdown(err.data.retryAfter);
    }
  }

  function setOtpAt(i, v) {
    const c = v.replace(/\D/g, '').slice(0, 1);
    const next = [...otp]; next[i] = c; setOtp(next);
    if (c && inputsRef.current[i + 1]) inputsRef.current[i + 1].focus();
  }
  function onKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && inputsRef.current[i - 1]) inputsRef.current[i - 1].focus();
  }
  function onPaste(e) {
    const d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
    if (!d) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    d.split('').forEach((c, j) => { next[j] = c; });
    setOtp(next);
    (inputsRef.current[Math.min(d.length, 5)] || inputsRef.current[5])?.focus();
  }

  async function verify() {
    const code = otp.join('');
    if (!/^\d{6}$/.test(code)) { setMsg({ text: 'Nhập đủ 6 chữ số OTP.', cls: 'error' }); return; }
    setBusy(true); setMsg({ text: 'Đang xác minh...', cls: '' });
    try {
      await api('/auth/verify-otp', { method: 'POST', body: { email, otp: code } });
      setVerifiedOtp(code); setStep(2); setMsg2({ text: '', cls: '' });
    } catch (err) {
      setMsg({ text: err.message, cls: 'error' });
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally { setBusy(false); }
  }

  async function reset() {
    if (!password || password.length < 8) {
      setMsg2({ text: 'Mật khẩu phải có ít nhất 8 ký tự (hoa, thường, số, ký tự đặc biệt).', cls: 'error' }); return;
    }
    if (password !== confirm) { setMsg2({ text: 'Xác nhận mật khẩu không khớp.', cls: 'error' }); return; }
    setBusy(true); setMsg2({ text: 'Đang cập nhật...', cls: '' });
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { email, otp: verifiedOtp, password, confirmPassword: confirm },
      });
      setMsg2({ text: 'Đổi mật khẩu thành công. Hãy đăng nhập lại.', cls: 'ok' });
      setTimeout(() => onClose(), 1200);
    } catch (err) { setMsg2({ text: err.message, cls: 'error' }); }
    finally { setBusy(false); }
  }

  if (!open) return null;
  return (
    <div className="fp-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fp-modal" role="dialog" aria-modal="true">
        <button className="fp-close" type="button" onClick={onClose}>×</button>
        {step === 1 ? (
          <div>
            <h2>Xác thực OTP</h2>
            <p className="muted">Mã OTP đã được gửi tới <strong>{email}</strong>. Kiểm tra hộp thư (cả mục Spam).</p>
            <div className="field">
              <label>Mã OTP (6 chữ số)</label>
              <div className="otp-inputs" onPaste={onPaste}>
                {otp.map((v, i) => (
                  <input key={i} ref={el => (inputsRef.current[i] = el)} type="text" inputMode="numeric"
                    maxLength={1} value={v} onChange={e => setOtpAt(i, e.target.value)} onKeyDown={e => onKey(i, e)} />
                ))}
              </div>
            </div>
            <div className={'fp-msg' + (msg.cls ? ' ' + msg.cls : '')}>{msg.text}</div>
            <button className="btn btn-primary btn-full" type="button" onClick={verify} disabled={busy}>Xác minh →</button>
            <div className="fp-resend">
              <button type="button" className="fp-link-btn" disabled={countdown > 0} onClick={sendOtp}>
                {countdown > 0 ? `Gửi lại OTP (${countdown}s)` : 'Gửi lại OTP'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Đặt mật khẩu mới</h2>
            <p className="muted">OTP đã xác minh cho <strong>{email}</strong>.</p>
            <div className="field"><label>Mật khẩu mới</label>
              <div className="input-wrap"><span className="ic">🔒</span>
                <input type="password" placeholder="Abcd@1234" value={password} onChange={e => setPassword(e.target.value)} /></div>
            </div>
            <div className="field"><label>Nhập lại mật khẩu mới</label>
              <div className="input-wrap"><span className="ic">🔐</span>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
            </div>
            <div className={'fp-msg' + (msg2.cls ? ' ' + msg2.cls : '')}>{msg2.text}</div>
            <button className="btn btn-primary btn-full" type="button" onClick={reset} disabled={busy}>Đổi mật khẩu →</button>
          </div>
        )}
      </div>
      <style>{`
.fp-overlay{position:fixed;inset:0;background:rgba(2,6,23,.65);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px}
.fp-overlay.open{display:flex}
.fp-modal{position:relative;background:#0f172a;color:#e2e8f0;border:1px solid rgba(255,255,255,.08);border-radius:16px;width:100%;max-width:440px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.fp-modal h2{margin:0 0 6px;font-size:22px} .fp-modal .muted{margin:0 0 18px;color:#94a3b8;font-size:14px}
.fp-close{position:absolute;top:10px;right:14px;background:transparent;border:0;color:#94a3b8;font-size:26px;cursor:pointer}
.fp-msg{min-height:20px;font-size:13px;margin:6px 0 12px} .fp-msg.error{color:#f87171} .fp-msg.ok{color:#34d399}
.fp-resend{margin-top:14px;text-align:center}
.fp-link-btn{background:transparent;border:0;color:#60a5fa;cursor:pointer;font-size:14px}
.fp-link-btn:disabled{color:#64748b;cursor:not-allowed}
      `}</style>
    </div>
  );
}
