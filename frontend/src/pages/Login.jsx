import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, Auth, API_BASE } from "../lib/api.js";
import { useFlash } from "../components/Flash.jsx";
import ForgotPasswordModal from "../components/ForgotPasswordModal.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [flashNode, showFlash] = useFlash();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [oauth, setOauth] = useState({ google: false, facebook: false });

  useEffect(() => {
    api("/auth/oauth-status")
      .then((r) => setOauth(r.oauth || {}))
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      Auth.set(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      showFlash("error", err.message);
    }
  }

  function openForgot(e) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("loginEmail")?.focus();
      showFlash("error", "Hãy nhập email hợp lệ ở ô Email trước.");
      return;
    }
    setForgotOpen(true);
  }

  return (
    <main className="container page">
      {flashNode}
      <Link className="back-link" to="/">
        ← Quay về trang chủ
      </Link>
      <div className="auth-grid">
        <section className="auth-panel">
          <div className="auth-tabs">
            <Link className="active" to="/login">
              Đăng nhập
            </Link>
            <Link to="/register">Đăng ký</Link>
          </div>
          <h1>Chào mừng trở lại</h1>
          <p className="muted">Đăng nhập để tiếp tục cuộc phiêu lưu của bạn</p>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <span className="ic">✉️</span>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <div className="input-wrap">
                <span className="ic">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="remember-forgot">
              <label className="remember-label">
                <input type="checkbox" id="remember" />
                <span>Ghi nhớ</span>
              </label>

              <a href="#" className="forgot-link" onClick={openForgot}>
                Quên mật khẩu?
              </a>
            </div>
            <button className="btn btn-primary btn-full" type="submit">
              Đăng nhập →
            </button>
          </form>
          <div className="divider">
            <span>hoặc tiếp tục với</span>
          </div>
          <div className="social-list">
            <button
              className={
                "social-btn google" + (oauth.google ? "" : " disabled-btn")
              }
              type="button"
              onClick={() =>
                oauth.google && (location.href = API_BASE + "/auth/google")
              }
            >
              G &nbsp;Google
            </button>
            <button
              className={
                "social-btn facebook" + (oauth.facebook ? "" : " disabled-btn")
              }
              type="button"
              onClick={() =>
                oauth.facebook && (location.href = API_BASE + "/auth/facebook")
              }
            >
              f &nbsp;Facebook
            </button>
          </div>
          <p className="bottom-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </section>
        <aside className="auth-side">
          <h3>🎮 Đặc quyền game thủ</h3>
          <p>Đăng nhập để mở khóa toàn bộ tính năng của AethelGard.</p>
          <ul>
            <li>Lưu tiến độ trên đám mây</li>
            <li>Đua top bảng xếp hạng</li>
            <li>Nhận quà mỗi ngày</li>
            <li>Trade item với bạn bè</li>
          </ul>
        </aside>
      </div>
      <ForgotPasswordModal
        open={forgotOpen}
        email={email}
        onClose={() => setForgotOpen(false)}
      />
    </main>
  );
}
