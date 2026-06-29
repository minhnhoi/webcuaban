import React from "react";
import { Link } from "react-router-dom";

const CancelPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
      <h1 style={{ color: "#e74c3c" }}>❌ Giao dịch đã hủy</h1>
      <p>Bạn đã hủy thanh toán. Nếu có vấn đề gì, vui lòng liên hệ Admin.</p>
      <Link to="/nap-the">
        <button style={{ padding: "10px 20px", cursor: "pointer" }}>
          Quay lại trang nạp tiền
        </button>
      </Link>
    </div>
  );
};

export default CancelPage;
