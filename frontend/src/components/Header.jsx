import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Auth, api } from '../lib/api.js';

export default function Header() {
  const [isAuth, setIsAuth] = useState(Auth.isLoggedIn());
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setIsAuth(Auth.isLoggedIn());
    window.addEventListener('auth-changed', fn);
    window.addEventListener('storage', fn);
    return () => {
      window.removeEventListener('auth-changed', fn);
      window.removeEventListener('storage', fn);
    };
  }, []);

  async function logout() {
    try { await api('/auth/logout', { method: 'POST', auth: true }); } catch {}
    Auth.clear();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="logo" to="/">
          <span className="logo-mark">🎮</span>
          <span className="logo-text">Aethel<span>Gard</span></span>
        </Link>
        <nav className="nav-links">
          <Link to="/">🏠 Trang Chủ</Link>
          <Link to="/cot-truyen">📖 Cốt Truyện</Link>
          <Link to="/nhan-vat">⚔️ Nhân Vật</Link>
          <Link to="/bxh">🏆 BXH</Link>
          <Link to="/dien-dan">💬 Diễn Đàn</Link>
          <Link to="/tai-game">⬇️ Tải Game</Link>
          <Link to="/nap-the">💎 Nạp Thẻ</Link>
        </nav>
        <div className="nav-actions">
          {isAuth ? (
            <>
              <Link className="btn-ghost-nav" to="/dashboard">Dashboard</Link>
              <button className="btn-grad-nav" type="button" onClick={logout}>Đăng Xuất</button>
            </>
          ) : (
            <>
              <Link className="btn-ghost-nav" to="/login">Đăng Nhập</Link>
              <Link className="btn-grad-nav" to="/register">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
