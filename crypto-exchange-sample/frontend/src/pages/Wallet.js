// src/pages/Wallet.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Wallet() {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWallets = async () => {
    try {
      const res = await API.get("/wallets");
      setWallets(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Failed to load wallets");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    loadWallets();
    const interval = setInterval(loadWallets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = async () => {
    if (!currency || !amount) return alert("Select currency and enter amount");
    try {
      await API.post("/wallets/deposit", {
        currency,
        amount: parseFloat(amount),
      });
      alert("Deposit successful");
      setAmount("");
      loadWallets();
    } catch (err) {
      alert(err.response?.data?.error || "Deposit failed");
    }
  };

  const handleSend = async () => {
    if (!toEmail || !currency || !amount) return alert("Fill all send fields");
    try {
      await API.post("/wallets/send", {
        toEmail,
        currency,
        amount: parseFloat(amount),
      });
      alert("Transfer successful");
      setToEmail("");
      setAmount("");
      loadWallets();
    } catch (err) {
      alert(err.response?.data?.error || "Transfer failed");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading wallets...</p>;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0b0b0b",
        color: "#fff",
      }}
    >
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "2.5rem",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        Wallet Manegement
      </h1>

      {/* Deposit & Send Section */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        {/* Deposit Card */}
        <div
          style={{
            flex: "1 1 450px",
            backgroundColor: "#1e1e2f",
            color: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            transition: "0.2s",
          }}
        >
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Deposit</h2>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "none",
              backgroundColor: "#2a2a3d",
              color: "#fff",
            }}
          >
            <option>USDT</option>
            <option>BTC</option>
            <option>ETH</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "none",
              backgroundColor: "#2a2a3d",
              color: "#fff",
            }}
          />
          <button
            onClick={handleDeposit}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#28a745",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            Deposit Funds
          </button>
        </div>

        {/* Send Card */}
        <div
          style={{
            flex: "1 1 450px",
            backgroundColor: "#1e1e2f",
            color: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            transition: "0.2s",
          }}
        >
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            Send Funds
          </h2>
          <input
            type="email"
            placeholder="Receiver Email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "none",
              backgroundColor: "#2a2a3d",
              color: "#fff",
            }}
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "none",
              backgroundColor: "#2a2a3d",
              color: "#fff",
            }}
          >
            <option>USDT</option>
            <option>BTC</option>
            <option>ETH</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "none",
              backgroundColor: "#2a2a3d",
              color: "#fff",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#007bff",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0069d9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Send Funds
          </button>
        </div>
      </div>

      {/* Wallet Balances */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#1e1e2f",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", fontWeight: "bold" }}>
          Your Wallet Balances
        </h2>
        {wallets.length === 0 ? (
          <p>No wallets found</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.95rem",
                minWidth: "500px",
              }}
            >
              <thead style={{ backgroundColor: "#2a2a3d", color: "#fff" }}>
                <tr>
                  <th style={{ padding: "12px" }}>Currency</th>
                  <th style={{ padding: "12px" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w, idx) => (
                  <tr
                    key={w.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#2e2e42" : "#1e1e2f",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#3a3a55")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? "#2e2e42" : "#1e1e2f")
                    }
                  >
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {w.currency}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {Number(w.balance).toFixed(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
