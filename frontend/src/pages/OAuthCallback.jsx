import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, Auth } from '../lib/api.js';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Vui lòng đợi giây lát.');

  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
      const token = hash.get('token');
      if (!token) { setMsg('Không nhận được token. Hãy thử lại.'); return; }
      try {
        const r = await fetch(API_BASE + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });
        const data = await r.json();
        if (!r.ok || !data.ok) throw new Error(data.message || 'Token không hợp lệ');
        Auth.set(token, data.user);
        navigate('/dashboard');
      } catch (e) { setMsg(e.message); }
    })();
  }, [navigate]);

  return (
    <main className="container page">
      <div className="single-card" style={{ textAlign: 'center' }}>
        <h1>Đang xử lý đăng nhập...</h1>
        <p className="muted">{msg}</p>
      </div>
    </main>
  );
}
