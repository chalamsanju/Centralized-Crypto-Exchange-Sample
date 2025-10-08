// src/pages/Trade.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Trade() {
  const navigate = useNavigate();
  const [side, setSide] = useState("buy");
  const [pair, setPair] = useState("BTC/USDT");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [orders, setOrders] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);

  const [base, quote] = pair.split("/");

  const loadBalances = async () => {
    try {
      setLoading(true);
      const res = await API.get("/wallets");
      const map = {};
      res.data.forEach((w) => (map[w.currency] = w.balance));
      setBalances(map);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Failed to load balances");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await API.get("/orders/list");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadBalances();
      loadOrders();
      const interval = setInterval(() => {
        loadBalances();
        loadOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const getBalance = (currency) => balances[currency] || 0;

  const setAmountByPercent = (percent) => {
    let bal =
      side === "buy"
        ? getBalance(quote) / Math.max(1, parseFloat(price) || 1)
        : getBalance(base);
    const a = (bal * percent) / 100;
    setAmount(Number.isFinite(a) ? a.toFixed(8) : "");
  };

  const placeOrder = async () => {
    if (!price || !amount) return alert("Enter price and amount");
    if (side === "buy") {
      const need = parseFloat(price) * parseFloat(amount);
      if (getBalance(quote) < need)
        return alert(
          `Insufficient ${quote} balance. Required: ${need}, Available: ${getBalance(
            quote
          )}`
        );
    } else {
      if (getBalance(base) < parseFloat(amount))
        return alert(
          `Insufficient ${base} balance. Required: ${amount}, Available: ${getBalance(
            base
          )}`
        );
    }

    try {
      const res = await API.post("/orders/place", {
        side,
        pair,
        price: parseFloat(price),
        amount: parseFloat(amount),
      });
      alert(res.data.message || "Order placed successfully");
      setPrice("");
      setAmount("");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Failed to place order");
      }
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "1rem 2rem 2rem 2rem",
        backgroundColor: "#0b0b0b",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "3rem",
          marginBottom: "2rem",
          marginTop: 0,
        }}
      >
        Trading
      </h1>

      {/* Trading + Balances */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {/* Place Order Card */}
        <div
          style={{
            flex: "1 1 400px",
            backgroundColor: "#1f1f2f",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Place Order</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label>
              Side:
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                style={{
                  marginLeft: "8px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#2a2a3d",
                  color: "#fff",
                }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </label>

            <label>
              Pair:
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                style={{
                  marginLeft: "8px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#2a2a3d",
                  color: "#fff",
                }}
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="BTC/ETH">BTC/ETH</option>
              </select>
            </label>

            <label>
              Price ({quote}):
              <input
                type="number"
                step="any"
                placeholder={`Price in ${quote}`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  marginLeft: "8px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#2a2a3d",
                  color: "#fff",
                }}
              />
            </label>

            <label>
              Amount ({base}):
              <input
                type="number"
                step="any"
                placeholder={`Amount in ${base}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  marginLeft: "8px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#2a2a3d",
                  color: "#fff",
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Balances:</strong> {base}: {getBalance(base)} | {quote}:{" "}
            {getBalance(quote)}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            Quick Amount:
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => setAmountByPercent(p)}
                style={{
                  marginLeft: "6px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#333",
                  color: "#fff",
                  transition: "0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#444")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#333")}
              >
                {p}%
              </button>
            ))}
          </div>

          <button
            onClick={placeOrder}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: side === "buy" ? "#28a745" : "#dc3545",
              color: "#fff",
              fontWeight: "bold",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor =
                side === "buy" ? "#218838" : "#c82333")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor =
                side === "buy" ? "#28a745" : "#dc3545")
            }
          >
            {side === "buy" ? `Buy ${base}` : `Sell ${base}`}
          </button>
        </div>

        {/* Orders Table */}
        <div
          style={{
            flex: "2 1 800px",
            backgroundColor: "#1f1f2f",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
            overflowX: "auto",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>All Orders</h2>
          <table
            style={{
              width: "1400px",
              borderCollapse: "collapse",
              color: "#fff",
            }}
          >
            <thead style={{ backgroundColor: "#2a2a3d" }}>
              <tr>
                <th style={{ padding: "12px 8px" }}>ID</th>
                <th>User</th>
                <th>Side</th>
                <th>Pair</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o, idx) => (
                  <tr
                    key={o.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#111" : "#1a1a1a",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#333")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? "#111" : "#1a1a1a")
                    }
                  >
                    <td style={{ padding: "12px 8px" }}>{o.id}</td>
                    <td>{o.userId}</td>
                    <td
                      style={{
                        color: o.side === "buy" ? "#28a745" : "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      {o.side.toUpperCase()}
                    </td>
                    <td>{o.pair}</td>
                    <td>{Number(o.price).toFixed(8)}</td>
                    <td>{Number(o.amount).toFixed(8)}</td>
                    <td>{Number(o.remaining).toFixed(8)}</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
