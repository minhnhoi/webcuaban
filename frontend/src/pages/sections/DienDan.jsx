export default function DienDan() {
  return (
    <main className="container page">
      <section className="section reveal">
        <div className="section-head">
          <span className="eyebrow">Diễn Đàn</span>
          <h2>Cộng đồng <span className="grad-text">AethelGard</span></h2>
          <p>Hơn 50,000 thành viên đang hoạt động mỗi ngày.</p>
        </div>
        <div className="card-grid">
          <div className="tile"><div className="ic">💬</div><h3>Thảo luận chung</h3><p>Chia sẻ kinh nghiệm chơi game.</p></div>
          <div className="tile"><div className="ic">🛠️</div><h3>Hướng dẫn & Mẹo</h3><p>Tips từ các cao thủ.</p></div>
          <div className="tile"><div className="ic">🎉</div><h3>Sự kiện</h3><p>Cập nhật các event mới nhất.</p></div>
        </div>
      </section>
    </main>
  );
}
