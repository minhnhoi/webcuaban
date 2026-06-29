export default function BXH() {
  return (
    <main className="container page">
      <section className="section reveal">
        <div className="section-head">
          <span className="eyebrow">Bảng Xếp Hạng</span>
          <h2>Top <span className="grad-text">game thủ</span> tuần này</h2>
        </div>
        <div className="bxh-list">
          <div className="bxh-row"><div className="bxh-rank">1</div><div className="bxh-name">DragonSlayer<small>Hiệp sĩ huyền thoại</small></div><div className="bxh-score">9,820 <span>pt</span></div></div>
          <div className="bxh-row"><div className="bxh-rank">2</div><div className="bxh-name">ShadowMira<small>Pháp sư bóng tối</small></div><div className="bxh-score">9,415 <span>pt</span></div></div>
          <div className="bxh-row"><div className="bxh-rank">3</div><div className="bxh-name">ArcherKing<small>Xạ thủ vương giả</small></div><div className="bxh-score">8,990 <span>pt</span></div></div>
          <div className="bxh-row"><div className="bxh-rank">4</div><div className="bxh-name">NinjaRavi<small>Sát thủ vô hình</small></div><div className="bxh-score">8,612 <span>pt</span></div></div>
          <div className="bxh-row"><div className="bxh-rank">5</div><div className="bxh-name">PixelHero<small>Tân binh xuất sắc</small></div><div className="bxh-score">8,201 <span>pt</span></div></div>
        </div>
      </section>
    </main>
  );
}
