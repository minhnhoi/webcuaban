import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, Auth } from "../lib/api.js";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function SuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // PayOS có thể nối thêm ?orderCode=<số> vào returnUrl. Lấy hết và gửi cả 2 lên backend.
  const allOrderCodes = params.getAll("orderCode");
  const orderCode = allOrderCodes.find((v) => /^NAP/i.test(v)) || allOrderCodes[0] || "";
  const payosOrderCode =
    allOrderCodes.find((v) => v && !/^NAP/i.test(v) && /^\d+$/.test(v)) || "";

  const [state, setState] = useState("verifying"); // verifying | success | pending | cancelled | error
  const [order, setOrder] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!Auth.isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (!orderCode) {
      setState("error");
      setMessage("Không tìm thấy mã đơn trong đường dẫn.");
      return;
    }

    let cancelled = false;
    let tries = 0;

    async function poll() {
      tries += 1;
      setAttempts(tries);
      try {
        const d = await api("/payment/order/verify", {
          method: "POST",
          auth: true,
          body: { orderCode, payosOrderCode },
        });
        if (cancelled) return;
        setOrder(d.order || null);
        if (d.wallet) setWallet(d.wallet);

        if (d.status === "success") {
          setState("success");
          return;
        }
        if (d.status === "cancelled") {
          setState("cancelled");
          return;
        }
        // pending: PayOS đôi khi cần vài giây để chuyển trạng thái sang PAID.
        if (tries < 6) {
          setTimeout(poll, 2000);
        } else {
          setState("pending");
        }
      } catch (e) {
        if (cancelled) return;
        if (tries < 4) {
          setTimeout(poll, 2500);
        } else {
          setState("error");
          setMessage(e.message || "Không kiểm tra được đơn hàng.");
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderCode, navigate]);

  return (
    <main className="container page">
      <section className="section reveal">
        <div
          className="success-box"
          style={{ textAlign: "center", padding: "40px 20px", maxWidth: 560, margin: "0 auto" }}
        >
          {state === "verifying" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>⏳</div>
              <h2>Đang xác nhận thanh toán…</h2>
              <p className="muted">
                Đang đối soát với PayOS{attempts > 1 ? ` (lần ${attempts})` : ""}, vui lòng chờ trong giây lát.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>✅</div>
              <h2>Nạp thành công!</h2>
              {order && (
                <p>
                  Mã đơn: <b>{order.orderCode}</b>
                </p>
              )}
              {order && (
                <p>
                  Bạn đã nhận:{" "}
                  {order.coinReward ? <b>+{fmt(order.coinReward)} Xu</b> : null}
                  {order.coinReward && order.gemReward ? " · " : ""}
                  {order.gemReward ? <b>+{fmt(order.gemReward)} Gem</b> : null}
                </p>
              )}
              {wallet && (
                <p>
                  Số dư: <b>{fmt(wallet.coin)} Xu</b> · <b>{fmt(wallet.gem)} Gem</b>
                </p>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
                <Link to="/nap-the" className="btn btn-primary">Nạp tiếp</Link>
                <Link to="/dashboard" className="btn btn-secondary">Về Dashboard</Link>
              </div>
            </>
          )}

          {state === "pending" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>🕒</div>
              <h2>Giao dịch đang xử lý</h2>
              <p>
                PayOS chưa báo trạng thái <b>PAID</b> cho đơn{" "}
                <b>{orderCode}</b>. Nếu bạn vừa thanh toán xong, vui lòng đợi
                khoảng 30 giây rồi bấm kiểm tra lại.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setState("verifying");
                    setAttempts(0);
                    // re-mount effect
                    navigate(`/success?orderCode=${orderCode}`, { replace: true });
                  }}
                >
                  Kiểm tra lại
                </button>
                <Link to="/nap-the" className="btn btn-secondary">Về trang nạp</Link>
              </div>
            </>
          )}

          {state === "cancelled" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>❌</div>
              <h2>Đơn đã bị huỷ</h2>
              <p>Đơn <b>{orderCode}</b> đã bị huỷ hoặc hết hạn trên PayOS.</p>
              <div style={{ marginTop: 18 }}>
                <Link to="/nap-the" className="btn btn-primary">Tạo đơn mới</Link>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>⚠️</div>
              <h2>Không xác minh được</h2>
              <p>{message}</p>
              <div style={{ marginTop: 18 }}>
                <Link to="/nap-the" className="btn btn-primary">Quay lại trang nạp</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
