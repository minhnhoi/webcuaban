import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, Auth, API_BASE } from "../../lib/api.js";

const TABS = [
  { id: "coin", label: "🪙 Nạp Xu" },
  { id: "gem", label: "💎 Nạp Gem" },
  { id: "promo", label: "🎁 Ưu Đãi" },
];

const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

// Map method.id -> logo bundled trong frontend/public/logos/
// Phải ghép với import.meta.env.BASE_URL để chạy đúng trên GitHub Pages subpath /webcuaban/.
const BASE_URL = import.meta.env.BASE_URL || "/";
const publicAsset = (path) => `${BASE_URL}${String(path).replace(/^\/+/, "")}`;

const LOCAL_LOGOS = {
  bank: "logos/bank.png",
  atm: "logos/napas.png",
  momo: "logos/momo.png",
  zalopay: "logos/zalopay.png",
  vnpay: "logos/vnpay.png",
  card: "logos/visa.png",
  visa: "logos/visa.png",
  telco: "logos/telco.png",
};

const FALLBACK_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23e8ecff"/><text x="32" y="38" font-size="28" text-anchor="middle" fill="%235e72ff" font-family="Arial">💳</text></svg>',
  );

const logoUrl = (path) =>
  path ? (path.startsWith("http") ? path : API_BASE + path) : "";
const methodLogo = (m) =>
  (m && LOCAL_LOGOS[m.id] && publicAsset(LOCAL_LOGOS[m.id])) ||
  logoUrl(m?.image) ||
  FALLBACK_LOGO;
const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_LOGO)
    e.currentTarget.src = FALLBACK_LOGO;
};

export default function NapThe() {
  const navigate = useNavigate();
  const loggedIn = Auth.isLoggedIn();

  const [tab, setTab] = useState("coin");
  const [packages, setPackages] = useState([]);
  const [methods, setMethods] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodDetail, setMethodDetail] = useState({});
  const [creating, setCreating] = useState(false);

  const [order, setOrder] = useState(null);
  const [instruction, setInstruction] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    api("/payment/packages")
      .then((d) => {
        setPackages(d.packages || []);
        setMethods(d.methods || []);
      })
      .catch(() => setError("Không tải được danh sách gói nạp"));
    if (loggedIn) {
      api("/payment/wallet", { auth: true })
        .then((d) => setWallet(d.wallet))
        .catch(() => {});
      api("/payment/history", { auth: true })
        .then((d) => setHistory(d.orders || []))
        .catch(() => {});
    }
  }, [loggedIn]);

  const filtered = useMemo(
    () => packages.filter((p) => p.type === tab),
    [packages, tab],
  );
  const method = useMemo(
    () => methods.find((m) => m.id === selectedMethod),
    [methods, selectedMethod],
  );

  function resetFlow() {
    setOrder(null);
    setInstruction(null);
    setSuccess(null);
    setError("");
  }

  function pickPkg(p) {
    resetFlow();
    setSelectedPkg(p);
    setSelectedMethod(null);
    setMethodDetail({});
  }

  function pickMethod(m) {
    resetFlow();
    setSelectedMethod(m.id);
    if (m.id === "bank" || m.id === "atm")
      setMethodDetail({ bank: m.options[0] });
    else if (m.id === "telco")
      setMethodDetail({
        provider: m.options[0],
        denomination: "",
        serial: "",
        pin: "",
      });
    else if (m.id === "card")
      setMethodDetail({ number: "", name: "", expiry: "", cvv: "" });
    else setMethodDetail({});
  }

  async function createOrder() {
    if (!loggedIn) {
      navigate("/login");
      return;
    }
    if (!selectedPkg || !selectedMethod) return;
    setError("");
    setCreating(true);
    try {
      const d = await api("/payment/order", {
        method: "POST",
        auth: true,
        body: {
          packageId: selectedPkg.id,
          method: selectedMethod,
          methodDetail,
        },
      });
      setOrder(d.order);
      setInstruction(d.instruction);

      // Nếu backend tạo được PayOS checkoutUrl thì chuyển thẳng sang trang quét QR của PayOS.
      // Trường hợp PayOS chưa cấu hình, frontend vẫn hiển thị QR/hướng dẫn chuyển khoản tại chỗ.
      if (d.instruction?.checkoutUrl) {
        window.location.assign(d.instruction.checkoutUrl);
        return;
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function confirmPaid() {
    if (!order) return;
    setError("");
    setConfirming(true);
    try {
      const d = await api("/payment/order/confirm", {
        method: "POST",
        auth: true,
        body: { orderCode: order.orderCode },
      });
      setSuccess(d.order);
      setWallet(d.wallet);
      api("/payment/history", { auth: true }).then((r) =>
        setHistory(r.orders || []),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setConfirming(false);
    }
  }

  async function cancel() {
    if (!order) return;
    try {
      await api("/payment/order/cancel", {
        method: "POST",
        auth: true,
        body: { orderCode: order.orderCode },
      });
    } catch {}
    resetFlow();
  }

  function copy(text, key) {
    try {
      navigator.clipboard?.writeText(String(text));
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  if (success) {
    return (
      <main className="container page">
        <section className="section reveal">
          <div
            className="success-box"
            style={{ textAlign: "center", padding: "40px 20px" }}
          >
            <div
              className="ic"
              style={{ fontSize: "3rem", marginBottom: "15px" }}
            >
              ✅
            </div>
            <h2>Nạp thành công!</h2>
            <p>
              Mã đơn: <b>{success.orderCode}</b>
            </p>
            <p>
              Bạn đã nhận:{" "}
              {success.coinReward ? <b>+{success.coinReward} Xu</b> : null}
              {success.coinReward && success.gemReward ? " · " : ""}
              {success.gemReward ? <b>+{success.gemReward} Gem</b> : null}
            </p>
            {success.bonusNote ? (
              <p style={{ color: "#ffd166" }}>🎁 {success.bonusNote}</p>
            ) : null}
            {wallet && (
              <p>
                Số dư: <b>{wallet.coin} Xu</b> · <b>{wallet.gem} Gem</b>
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 18,
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetFlow();
                  setSelectedPkg(null);
                  setSelectedMethod(null);
                }}
              >
                Nạp tiếp
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Về Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container page">
      <section className="section reveal">
        <div className="section-head">
          <span className="eyebrow">Nạp Thẻ</span>
          <h2>
            Nạp <span className="grad-text">Xu & Gem</span>
          </h2>
          <p>
            Hỗ trợ ngân hàng, MoMo, ZaloPay, VNPay, thẻ Visa/Master và thẻ cào
            nhà mạng.
          </p>
        </div>

        <div className="nap-wrap">
          {loggedIn && wallet && (
            <div className="wallet-bar">
              <div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  Số dư hiện tại
                </div>
                <div className="bal">
                  <span>
                    🪙 <b>{wallet.coin}</b> Xu
                  </span>
                  <span>
                    💎 <b>{wallet.gem}</b> Gem
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Tài khoản:{" "}
                <b style={{ color: "#fff" }}>
                  {Auth.user?.name || Auth.user?.email}
                </b>
              </div>
            </div>
          )}
          {!loggedIn && (
            <div className="alert-warn">
              Bạn cần{" "}
              <Link
                to="/login"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                đăng nhập
              </Link>{" "}
              trước khi nạp.
            </div>
          )}

          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={"tab" + (tab === t.id ? " active" : "")}
                onClick={() => {
                  setTab(t.id);
                  setSelectedPkg(null);
                  setSelectedMethod(null);
                  resetFlow();
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pkg-grid">
            {filtered.map((p) => (
              <div
                key={p.id}
                className={
                  "pkg" + (selectedPkg?.id === p.id ? " selected" : "")
                }
                onClick={() => pickPkg(p)}
              >
                {p.tag && <span className="tag">{p.tag}</span>}
                <h4>{p.name}</h4>
                <div className="price">{fmt(p.amount)}</div>
                <div className="reward">
                  {p.coin ? `🪙 +${p.coin} Xu` : ""}
                  {p.coin && p.gem ? " · " : ""}
                  {p.gem ? `💎 +${p.gem} Gem` : ""}
                </div>
                {p.bonus && <div className="bonus">🎁 {p.bonus}</div>}
              </div>
            ))}
          </div>

          {selectedPkg && !order && (
            <div>
              <h3 style={{ marginTop: 24, marginBottom: 12 }}>
                Chọn phương thức thanh toán
              </h3>
              <div className="pm-grid">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={
                      "pm" + (selectedMethod === m.id ? " selected" : "")
                    }
                    onClick={() => pickMethod(m)}
                  >
                    <span className="pm-logo">
                      <img
                        src={methodLogo(m)}
                        alt={m.name}
                        loading="lazy"
                        onError={handleImgError}
                      />
                    </span>
                    <span className="pm-text">
                      <span className="nm">{m.name}</span>
                      {m.desc && <span className="pm-desc">{m.desc}</span>}
                    </span>
                  </button>
                ))}
              </div>

              {method && (
                <MethodForm
                  method={method}
                  value={methodDetail}
                  onChange={setMethodDetail}
                  pkgAmount={selectedPkg.amount}
                />
              )}

              {selectedMethod && (
                <div className="summary" style={{ marginTop: 18 }}>
                  <div className="row">
                    <span>Gói</span>
                    <b>{selectedPkg.name}</b>
                  </div>
                  <div className="row">
                    <span>Phần thưởng</span>
                    <b>
                      {selectedPkg.coin ? `+${selectedPkg.coin} Xu` : ""}
                      {selectedPkg.coin && selectedPkg.gem ? " · " : ""}
                      {selectedPkg.gem ? `+${selectedPkg.gem} Gem` : ""}
                    </b>
                  </div>
                  {selectedPkg.bonus && (
                    <div className="row">
                      <span>Quà thêm</span>
                      <b style={{ color: "#ffd166" }}>{selectedPkg.bonus}</b>
                    </div>
                  )}
                  <div className="row">
                    <span>Phương thức</span>
                    <b
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <img
                        src={methodLogo(method)}
                        alt=""
                        onError={handleImgError}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: "#fff",
                          objectFit: "contain",
                          padding: 2,
                        }}
                      />
                      {method?.name}
                    </b>
                  </div>
                  <div className="row">
                    <span>Tổng thanh toán</span>
                    <b style={{ color: "#ff3da6" }}>
                      {fmt(selectedPkg.amount)}
                    </b>
                  </div>
                  {error && <div className="alert-warn">{error}</div>}
                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 14 }}
                    disabled={creating}
                    onClick={createOrder}
                  >
                    {creating ? "Đang tạo đơn…" : "Tiến hành thanh toán"}
                  </button>
                </div>
              )}
            </div>
          )}

          {order && instruction && (
            <div
              style={{
                background: "#151728",
                padding: "25px",
                borderRadius: "12px",
                marginTop: "20px",
                border: "1px solid #23263d",
              }}
            >
              <div
                className="pay-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={methodLogo(method)}
                  alt=""
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                    background: "#fff",
                    padding: "4px",
                    borderRadius: "8px",
                  }}
                  onError={handleImgError}
                />
                <div>
                  <div
                    className="pay-header-title"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {instruction.title}
                  </div>
                  <div
                    className="pay-header-sub"
                    style={{ color: "var(--muted)", fontSize: "0.9rem" }}
                  >
                    Mã đơn <b>{order.orderCode}</b> · {fmt(order.amount)}
                  </div>
                </div>
                <span
                  className={"badge " + order.status}
                  style={{
                    marginLeft: "auto",
                    background: "#2a2e45",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* KHU VỰC QUÉT MÃ QR ĐỘNG KẾT NỐI TỪ VIETQR BACKEND */}
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "20px 0",
                }}
              >
                {instruction.qrImage ? (
                  /* Ưu tiên 1: Đọc ảnh QR động Base64 trả về trực tiếp từ hàm sinh mã VietQR */
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        background: "#fff",
                        padding: "12px",
                        borderRadius: "12px",
                        display: "inline-block",
                      }}
                    >
                      <img
                        alt="VietQR Động"
                        src={instruction.qrImage}
                        style={{
                          width: "220px",
                          height: "220px",
                          display: "block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#00adb5",
                        marginTop: "8px",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    >
                      MÃ QR TỰ ĐỘNG ĐIỀN TIỀN & NỘI DUNG
                    </div>
                  </div>
                ) : instruction.qrText ? (
                  /* Dự phòng 2: Nếu chỉ có chuỗi qrText, gọi API tạo mã bên ngoài */
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        background: "#fff",
                        padding: "12px",
                        borderRadius: "12px",
                        display: "inline-block",
                      }}
                    >
                      <img
                        alt="QR Link"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(instruction.qrText)}`}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        marginTop: "8px",
                      }}
                    >
                      Mở app ngân hàng &amp; quét mã
                    </div>
                  </div>
                ) : null}

                {/* Bảng thông tin tài khoản nếu thanh toán bằng chuyển khoản ngân hàng */}
                {(order.method === "bank" || order.method === "atm") && (
                  <div
                    className="bank-card"
                    style={{
                      flex: "1",
                      minWidth: "260px",
                      background: "#1c1f35",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      className="bank-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #2a2e45",
                      }}
                    >
                      <span>Ngân hàng</span>
                      <b>{order.methodDetail?.bank || "Vietcombank"}</b>
                    </div>
                    <div
                      className="bank-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #2a2e45",
                      }}
                    >
                      <span>Chủ tài khoản</span>
                      <b>{instruction.accountName || "PHAM QUANG MINH"}</b>
                    </div>
                    <div
                      className="bank-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #2a2e45",
                      }}
                    >
                      <span>Số tài khoản</span>
                      <b
                        className="copyable"
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        {instruction.accountNo || "1234567890"}
                        <button
                          className="btn-copy"
                          style={{
                            background: "#3a3f58",
                            border: "none",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                          onClick={() =>
                            copy(instruction.accountNo || "1234567890", "stk")
                          }
                        >
                          {copied === "stk" ? "Đã copy" : "Copy"}
                        </button>
                      </b>
                    </div>
                    <div
                      className="bank-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #2a2e45",
                      }}
                    >
                      <span>Số tiền cần nạp</span>
                      <b
                        className="copyable"
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        {fmt(order.amount)}
                        <button
                          className="btn-copy"
                          style={{
                            background: "#3a3f58",
                            border: "none",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                          onClick={() => copy(order.amount, "amt")}
                        >
                          {copied === "amt" ? "Đã copy" : "Copy"}
                        </button>
                      </b>
                    </div>
                    <div
                      className="bank-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                      }}
                    >
                      <span>Nội dung CK</span>
                      <b
                        className="copyable"
                        style={{
                          color: "#ff3da6",
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        {order.orderCode}
                        <button
                          className="btn-copy"
                          style={{
                            background: "#3a3f58",
                            border: "none",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                          onClick={() => copy(order.orderCode, "memo")}
                        >
                          {copied === "memo" ? "Đã copy" : "Copy"}
                        </button>
                      </b>
                    </div>
                  </div>
                )}
              </div>

              <ul
                className="steps"
                style={{
                  paddingLeft: "20px",
                  color: "#b9bbbe",
                  lineHeight: "1.8",
                }}
              >
                {instruction.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <div
                className="alert-info"
                style={{
                  marginTop: "15px",
                  background: "rgba(0, 173, 181, 0.1)",
                  border: "1px solid #00adb5",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                ⚠️ Đây là <b>DEMO</b>: bấm "Tôi đã thanh toán" sẽ giả lập
                backend nhận tiền và cộng Xu/Gem vào ví ngay.
              </div>

              {error && (
                <div
                  className="alert-warn"
                  style={{ color: "#ff4a5a", marginTop: "10px" }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: "10px 20px", fontWeight: "bold" }}
                  disabled={confirming}
                  onClick={confirmPaid}
                >
                  {confirming ? "Đang xác nhận…" : "✅ Tôi đã thanh toán"}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "10px 15px" }}
                  onClick={cancel}
                >
                  Hủy đơn
                </button>
              </div>
            </div>
          )}

          {loggedIn && history.length > 0 && !order && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 10 }}>Lịch sử giao dịch</h3>
              <div style={{ overflowX: "auto" }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Gói</th>
                      <th>Số tiền</th>
                      <th>PT</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((o) => (
                      <tr key={o.orderCode}>
                        <td>{o.orderCode}</td>
                        <td>{o.packageId}</td>
                        <td>{fmt(o.amount)}</td>
                        <td>{o.method}</td>
                        <td>
                          <span className={"badge " + o.status}>
                            {o.status}
                          </span>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MethodForm({ method, value, onChange, pkgAmount }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  if (method.id === "bank" || method.id === "atm") {
    return (
      <div className="form-row" style={{ marginTop: "15px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Chọn ngân hàng của admin để thanh toán 
        </label>
        <select
          value={value.bank || ""}
          onChange={(e) => set("bank", e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            background: "#202236",
            color: "#fff",
            border: "1px solid #3a3f58",
          }}
        >
          {method.options.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <div
          className="alert-info"
          style={{ marginTop: "10px", fontSize: "0.85rem", opacity: 0.8 }}
        >
          Sau khi tạo đơn, hệ thống sẽ sinh ra một **mã VietQR động**. Bạn mở
          ứng dụng ngân hàng quét mã để thanh toán nhanh mà không cần gõ thủ
          công.
        </div>
      </div>
    );
  }

  if (method.id === "card") {
    const num = (value.number || "").replace(/\s+/g, "");
    const pretty =
      num.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••";
    return (
      <div className="form-row" style={{ marginTop: "15px" }}>
        <div className="credit-card-preview">
          <div className="cc-chip" />
          <div className="cc-brand">VISA · MC · JCB</div>
          <div className="cc-num">{pretty}</div>
          <div className="cc-foot">
            <div>
              <span>Chủ thẻ</span>
              <b>{value.name || "CARDHOLDER NAME"}</b>
            </div>
            <div>
              <span>Hết hạn</span>
              <b>{value.expiry || "MM/YY"}</b>
            </div>
          </div>
        </div>
        <label>Số thẻ</label>
        <input
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          value={value.number || ""}
          onChange={(e) =>
            set(
              "number",
              e.target.value
                .replace(/[^0-9 ]/g, "")
                .replace(/\s+/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim(),
            )
          }
        />
        <label>Tên in trên thẻ</label>
        <input
          placeholder="NGUYEN VAN A"
          value={value.name || ""}
          onChange={(e) => set("name", e.target.value.toUpperCase())}
        />
        <div className="grid2">
          <div>
            <label>MM/YY</label>
            <input
              placeholder="12/28"
              maxLength={5}
              value={value.expiry || ""}
              onChange={(e) => {
                let v = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                set("expiry", v);
              }}
            />
          </div>
          <div>
            <label>CVV</label>
            <input
              inputMode="numeric"
              placeholder="123"
              maxLength={4}
              value={value.cvv || ""}
              onChange={(e) =>
                set("cvv", e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </div>
        </div>
        <div className="alert-info">
          🔒 Demo: thẻ không bị tính phí. Chỉ 4 số cuối được lưu để hiển thị hoá
          đơn.
        </div>
      </div>
    );
  }

  if (method.id === "telco") {
    return (
      <div className="form-row" style={{ marginTop: "15px" }}>
        <div className="grid2">
          <div>
            <label>Nhà mạng</label>
            <select
              value={value.provider || ""}
              onChange={(e) => set("provider", e.target.value)}
            >
              {method.options.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Mệnh giá</label>
            <select
              value={value.denomination || ""}
              onChange={(e) => set("denomination", e.target.value)}
            >
              <option value="">-- Chọn --</option>
              {method.denominations.map((d) => (
                <option key={d} value={d}>
                  {fmt(d)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label>Serial</label>
        <input
          value={value.serial || ""}
          onChange={(e) => set("serial", e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Dãy số in trên thẻ"
        />
        <label>Mã thẻ (PIN)</label>
        <input
          value={value.pin || ""}
          onChange={(e) => set("pin", e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Cào để lấy mã"
        />
        <div className="alert-info">
          Chiết khấu thẻ cào ~30%. Mệnh giá phải khớp số tiền gói (
          {fmt(pkgAmount)}).
        </div>
      </div>
    );
  }

  return (
    <div className="ewallet-hint" style={{ marginTop: "15px" }}>
      <div className="ewallet-steps">
        <span>
          1. Bấm <b>Tiến hành thanh toán</b>
        </span>
        <span>
          2. Mở app <b>{method.name}</b>
        </span>
        <span>3. Quét mã QR &amp; xác nhận</span>
        <span>
          4. Bấm <b>Tôi đã thanh toán</b>
        </span>
      </div>
    </div>
  );
}
