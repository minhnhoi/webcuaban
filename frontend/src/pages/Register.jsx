import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api, Auth } from '../lib/api.js';
import { useFlash } from '../components/Flash.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [flashNode, showFlash] = useFlash();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const data = await api('/auth/register', { method: 'POST', body: form });
      Auth.set(data.token, data.user);
      navigate('/dashboard');
    } catch (err) { showFlash('error', err.message); }
  }

  return (
    <main className="container page">
      {flashNode}
      <Link className="back-link" to="/">← Quay về trang chủ</Link>
      <div className="auth-grid">
        <section className="auth-panel">
          <div className="auth-tabs"><Link to="/login">Đăng nhập</Link><Link className="active" to="/register">Đăng ký</Link></div>
          <h1>Tạo tài khoản</h1>
          <p className="muted">Bắt đầu hành trình của bạn trong vài giây.</p>
          <form className="form" onSubmit={onSubmit}>
            <div className="field"><label>Họ và tên</label>
              <div className="input-wrap"><span className="ic">👤</span>
                <input type="text" name="name" placeholder="Ví dụ: Minh Phạm" required value={form.name} onChange={onChange} /></div>
            </div>
            <div className="field"><label>Email</label>
              <div className="input-wrap"><span className="ic">✉️</span>
                <input type="email" name="email" placeholder="you@example.com" required value={form.email} onChange={onChange} /></div>
            </div>
            <div className="field"><label>Mật khẩu</label>
              <div className="input-wrap"><span className="ic">🔒</span>
                <input type="password" name="password" placeholder="Abcd@1234" required value={form.password} onChange={onChange} /></div>
              <small>Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</small>
            </div>
            <div className="field"><label>Nhập lại mật khẩu</label>
              <div className="input-wrap"><span className="ic">🔐</span>
                <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={onChange} /></div>
            </div>
            <button className="btn btn-primary btn-full" type="submit">Đăng ký ngay →</button>
          </form>
          <p className="bottom-text">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </section>
        <aside className="auth-side">
          <h3>✨ Phần thưởng tân binh</h3>
          <p>Hoàn tất đăng ký để nhận ngay gói chào mừng.</p>
          <ul><li>1,000 Xu chào mừng</li><li>10 Gem khởi đầu</li><li>Trang phục đặc biệt</li><li>Vé event 7 ngày</li></ul>
        </aside>
      </div>
    </main>
  );
}
