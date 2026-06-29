import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Auth } from '../lib/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(Auth.user);

  useEffect(() => {
    api('/auth/me', { auth: true })
      .then(r => { Auth.set(Auth.token, r.user); setUser(r.user); })
      .catch(() => { Auth.clear(); navigate('/login'); });
  }, [navigate]);

  if (!user) return <main className="container page"><p className="muted">Đang tải...</p></main>;

  return (
    <main className="container page">
      <div id="flash" />
      <section className="dashboard">
        <div className="profile-card">
          <div className="avatar">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" />
              : <span>{(user.name || '?').charAt(0).toUpperCase()}</span>}
          </div>
          <div>
            <h1>Xin chào, <span>{user.name}</span></h1>
            <p className="muted">{user.email}</p>
            <p className="muted">Provider: <strong>{user.provider}</strong></p>
          </div>
        </div>
      </section>
    </main>
  );
}
