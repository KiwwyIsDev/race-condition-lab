"use client";

import { useCallback, useEffect, useState } from "react";

interface Product { id: number; name: string; price: number; stock: number; }
interface Order   { id: number; buyer: string; created_at: string; }

export default function HomePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProduct = useCallback(async () => {
    const r = await fetch("/api/products");
    if (r.ok) setProduct(await r.json());
  }, []);

  const fetchOrders = useCallback(async () => {
    const r = await fetch("/api/orders");
    if (!r.ok) return;
    setOrders(await r.json());
  }, []);

  const refresh = useCallback(
    () => Promise.all([fetchProduct(), fetchOrders()]),
    [fetchProduct, fetchOrders],
  );

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleBuy() {
    setLoading(true);
    setMessage(null);
    const r = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer: "นักเรียน" }),
    });
    const d = await r.json();
    setMessage({ text: d.message ?? d.error, ok: r.ok && d.success });
    setLoading(false);
    refresh();
  }

  async function handleReset() {
    setLoading(true);
    setMessage(null);
    const r = await fetch("/api/reset", { method: "POST" });
    const d = await r.json();
    setMessage({ text: d.message ?? d.error, ok: r.ok });
    setLoading(false);
    refresh();
  }

  const oversold   = !!product && product.stock < 0;
  const outOfStock = !product  || product.stock <= 0;

  const stockBoxClass = oversold ? " danger" : outOfStock ? " sold-out" : "";

  return (
    <div className="app">

      {/* ── Header ─────────────────────────────────── */}
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">
            {/* Shield icon */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3L4 7v5c0 4.418 3.582 8.302 8 9 4.418-.698 8-4.582 8-9V7L12 3z"/>
            </svg>
          </div>
          <span className="header-title">Race Condition Lab</span>
        </div>
        <div className="header-divider" />
        <span className="header-sub">TOCTOU · Flash Sale Demo</span>
        <div className="header-spacer" />
        <div className="header-badge">
          <span className="live-dot" />
          Live
        </div>
      </header>

      <main className="content">

        {/* ── Demo + Orders ────────────────────────── */}
        <div className="mid-grid">

          {/* Demo */}
          <div className="card">
            <div className="card-header">
              <span className="card-label">ทดลองใช้งาน</span>
            </div>
            <div className="card-body">
              {product ? (
                <>
                  <div className="product-row">
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                  </div>

                  <div className={`stock-box${stockBoxClass}`}>
                    <div className="stock-tag">Stock คงเหลือ</div>
                    <div className="stock-num">{product.stock}</div>
                    <div className="stock-sublabel">
                      {oversold   ? "ขายเกินจริงแล้ว" :
                       outOfStock ? "หมด Stock"        : ""}
                    </div>
                  </div>

                  <div className="btn-row">
                    <button
                      className="btn btn-primary"
                      onClick={handleBuy}
                      disabled={loading || outOfStock}
                    >
                      {loading
                        ? <><span className="spin" /> กำลังดำเนินการ</>
                        : "สั่งซื้อ (1 ครั้ง)"
                      }
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      รีเซ็ต
                    </button>
                  </div>

                  {message && (
                    <div className={`status-msg ${message.ok ? "ok" : "err"}`}>
                      {message.text}
                    </div>
                  )}

                </>
              ) : (
                <div className="empty-table">กำลังโหลด...</div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="card">
            <div className="card-header">
              <span className="card-label">Order ที่เกิดขึ้น</span>
              <span className={`order-count-badge${orders.length > 1 ? " warn" : ""}`}>
                {orders.length} รายการ
              </span>
            </div>
            <div className="card-body">

              {orders.length > 1 && (
                <div className="race-alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{flexShrink:0}}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Race Condition พบแล้ว — {orders.length} Order จากสินค้า 1 ชิ้น
                </div>
              )}

              <div className="table-wrap">
                {orders.length === 0 ? (
                  <div className="empty-table">
                    ยังไม่มี Order — กด "สั่งซื้อ" หรือรัน exploit.py
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>ผู้ซื้อ</th>
                        <th>เวลา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.id} className={i >= 1 ? "extra" : ""}>
                          <td>{o.id}</td>
                          <td>{o.buyer}</td>
                          <td>{o.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {orders.length > 1 && (
                <div className="explain-note">
                  Stock มีแค่ 1 ชิ้น แต่มี Order ถึง <strong>{orders.length} ใบ</strong>
                  (แถวสีแดง = Order เกินสต็อก) — เพราะทุกคำสั่งผ่านการ "ตรวจสอบ"
                  ก่อนที่ระบบจะ "ลด Stock" ได้
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      <footer className="footer">
        <span className="footer-text">Race Condition Lab · สำหรับการศึกษาเท่านั้น</span>
        <span className="footer-stack">Next.js 16 · SQLite WAL · Node 22</span>
      </footer>

    </div>
  );
}
