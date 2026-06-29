import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container page">
      <div className="single-card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '5rem', margin: 0 }}>404</h1>
        <p className="muted">Không tìm thấy trang bạn yêu cầu.</p>
        <Link className="btn btn-primary" to="/">← Về trang chủ</Link>
      </div>
    </main>
  );
}
