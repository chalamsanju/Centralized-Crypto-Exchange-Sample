// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchOrders();
    const interval = setInterval(() => {
      fetchDashboard();
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const userRes = await API.get("/auth/me");
      setMe(userRes.data);

      const walletRes = await API.get("/wallets");
      setWallets(walletRes.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setMe(null);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/list");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading dashboard...</p>;
  if (!me)
    return (
      <p style={{ color: "#fff" }}>Please login to access your dashboard</p>
    );

  const username = me.email.split("@")[0];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#0b0b0b",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.2rem", marginBottom: "2rem" }}>Dashboard</h1>

      {/* User Info */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            flex: "1 1 300px",
            backgroundColor: "#1f1f2f",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>User Info</h2>
          <p>
            <strong>ID:</strong> {me.id}
          </p>
          <p>
            <strong>Username:</strong> {username}
          </p>
          <p>
            <strong>Email:</strong> {me.email}
          </p>
          <p>
            <strong>Role:</strong> {me.role}
          </p>
        </div>

        {/* Wallets */}
        <div
          style={{
            flex: "2 1 600px",
            backgroundColor: "#1f1f2f",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Wallet Balances</h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#fff",
              }}
            >
              <thead style={{ backgroundColor: "#2a2a3d" }}>
                <tr>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>
                    Currency
                  </th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w, idx) => (
                  <tr
                    key={w.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#1f1f2f" : "#2a2a3d",
                      transition: "0.2s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#333")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? "#1f1f2f" : "#2a2a3d")
                    }
                  >
                    <td style={{ padding: "12px 8px" }}>{w.currency}</td>
                    <td style={{ padding: "12px 8px" }}>
                      {Number(w.balance).toFixed(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div
        style={{
          backgroundColor: "#1f1f2f",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Orders</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "1400px", // horizontal expansion
              borderCollapse: "collapse",
              color: "#fff",
            }}
          >
            <thead style={{ backgroundColor: "#2a2a3d" }}>
              <tr>
                <th style={{ padding: "12px 8px" }}>ID</th>
                <th>User ID</th>
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
                      backgroundColor:
                        o.userId === me.id
                          ? "#2a2a3d"
                          : idx % 2 === 0
                          ? "#1f1f2f"
                          : "#2a2a3d",
                      transition: "0.2s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#333")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        o.userId === me.id
                          ? "#2a2a3d"
                          : idx % 2 === 0
                          ? "#1f1f2f"
                          : "#2a2a3d")
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
