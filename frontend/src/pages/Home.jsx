import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="container page">
      <div id="flash" />
      <section className="hero">
        <div className="hero-card">
          <div className="hero-brand">
            <span className="logo-mark">🎮</span>
            <div><h3>Pixel Adventure</h3><p>Game 2D Platformer Hàng Đầu</p></div>
          </div>
          <h1><span className="grad-text">Khởi đầu hành trình</span><br />phiêu lưu của bạn</h1>
          <p className="lead">Tạo tài khoản để lưu tiến độ, nhận quà mỗi ngày và đua top với hàng nghìn người chơi khác trên toàn thế giới.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">🚀 Tạo tài khoản</Link>
            <Link className="btn btn-secondary" to="/login">Đăng nhập</Link>
          </div>
          <div className="hero-features">
            <div className="hf"><div className="hf-ic">⭐</div><div><strong>1000 Xu chào mừng</strong></div></div>
            <div className="hf"><div className="hf-ic">🎁</div><div><strong>10 Gem khởi đầu</strong></div></div>
            <div className="hf"><div className="hf-ic">🛡️</div><div><strong>Lưu tiến độ cloud</strong></div></div>
            <div className="hf"><div className="hf-ic">⚡</div><div><strong>BXH toàn cầu</strong></div></div>
          </div>
          <div className="hero-stats">✨ Đã có hơn <b>120,000+</b> game thủ tham gia</div>
        </div>
        <div className="auth-panel reveal">
          <div className="auth-tabs"><Link className="active" to="/login">Đăng nhập</Link><Link to="/register">Đăng ký</Link></div>
          <h1>Chào mừng trở lại</h1>
          <p className="muted">Đăng nhập để tiếp tục cuộc phiêu lưu của bạn</p>
          <Link className="btn btn-primary btn-full" to="/login">Bắt đầu →</Link>
          <p className="bottom-text">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </section>

      <section className="section reveal">
        <div className="section-head">
          <span className="eyebrow">Khám phá</span>
          <h2>Bước vào thế giới <span className="grad-text">AethelGard</span></h2>
          <p>Chọn một mục bên dưới để tìm hiểu thêm.</p>
        </div>
        <div className="card-grid">
          <Link className="tile" to="/cot-truyen"><div className="ic">📖</div><h3>Cốt Truyện</h3><p>Truyền thuyết AethelGard.</p></Link>
          <Link className="tile" to="/nhan-vat"><div className="ic">⚔️</div><h3>Nhân Vật</h3><p>Chọn anh hùng của bạn.</p></Link>
          <Link className="tile" to="/bxh"><div className="ic">🏆</div><h3>BXH</h3><p>Top game thủ tuần này.</p></Link>
          <Link className="tile" to="/dien-dan"><div className="ic">💬</div><h3>Diễn Đàn</h3><p>Cộng đồng 50,000+ thành viên.</p></Link>
          <Link className="tile" to="/tai-game"><div className="ic">⬇️</div><h3>Tải Game</h3><p>Windows · macOS · Linux · Mobile.</p></Link>
          <Link className="tile" to="/nap-the"><div className="ic">💎</div><h3>Nạp Thẻ</h3><p>Momo · ZaloPay · VNPay · Visa.</p></Link>
        </div>
      </section>
    </main>
  );
}
