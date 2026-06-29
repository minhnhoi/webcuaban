export default function TaiGame() {
  return (
    <main className="container page">
      <section className="section reveal">
        <div className="section-head">
          <span className="eyebrow">Tải Game</span>
          <h2>Tải <span className="grad-text">AethelGard</span> ngay</h2>
          <p>Có mặt trên mọi nền tảng phổ biến.</p>
        </div>
        <div className="card-grid">
          <div className="tile"><div className="ic">🪟</div><h3>Windows</h3><p>Phiên bản 1.0 · 250 MB</p></div>
          <div className="tile"><div className="ic">🍎</div><h3>macOS</h3><p>Phiên bản 1.0 · 240 MB</p></div>
          <div className="tile"><div className="ic">🐧</div><h3>Linux</h3><p>Phiên bản 1.0 · 230 MB</p></div>
          <div className="tile"><div className="ic">📱</div><h3>Mobile</h3><p>Android & iOS</p></div>
        </div>
      </section>
    </main>
  );
}
