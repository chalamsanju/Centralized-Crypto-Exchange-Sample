// src/pages/Home.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Login/signup modal state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Load user info
  const loadUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  const loadWallets = async () => {
    try {
      const res = await API.get("/wallets");
      setWallets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMarkets = async () => {
    setMarkets([
      { pair: "BTC/USDT", price: 29750.12, change: 1.2 },
      { pair: "ETH/USDT", price: 1870.55, change: -0.5 },
      { pair: "BNB/USDT", price: 330.45, change: 2.1 },
      { pair: "XRP/USDT", price: 0.58, change: -1.3 },
      { pair: "ADA/USDT", price: 0.32, change: 0.8 },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadUser();
      await loadWallets();
      await loadMarkets();
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      await loadUser();
      setShowLogin(false);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      await API.post("/auth/register", { email, password });
      alert("Signup successful! Please login.");
      setShowSignup(false);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  if (loading)
    return <p style={{ textAlign: "center", color: "#fff" }}>Loading...</p>;

  const username = user?.email?.split("@")[0] || "User";
  const totalBalance = wallets.reduce(
    (acc, w) => acc + Number(w.balance || 0),
    0
  );

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          {user ? `Welcome, ${username}!` : "Trade Crypto with Ease"}
        </h1>
        <p style={styles.heroDesc}>
          {user
            ? "Manage your crypto portfolio, trades, and wallets effortlessly"
            : "Buy, sell, and manage crypto safely and quickly."}
        </p>

        {/* Show total balance if logged in */}
        {user && (
          <div style={styles.balanceCard}>
            <h2>Total Balance</h2>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
              ${totalBalance.toFixed(2)}
            </p>
          </div>
        )}

        {/* Login/Signup buttons if not logged in */}
        {!user && (
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <button style={styles.button} onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button
              style={styles.buttonOutline}
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </div>
        )}
      </section>

      {/* Wallets Section */}
      {user && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Wallets</h2>
          <div style={styles.horizontalScroll}>
            {wallets.map((w) => (
              <div key={w.id} style={styles.walletCard}>
                <h3>{w.currency}</h3>
                <p>Balance: {Number(w.balance).toFixed(8)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Markets Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Markets</h2>
        <div style={styles.horizontalScroll}>
          {markets.map((m) => (
            <div key={m.pair} style={styles.marketCard}>
              <h3>{m.pair}</h3>
              <p>Price: ${m.price.toFixed(2)}</p>
              <p
                style={{
                  color: m.change >= 0 ? "#28a745" : "#dc3545",
                  fontWeight: "bold",
                }}
              >
                {m.change >= 0 ? "+" : ""}
                {m.change}%
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div style={styles.modalBackdrop} onClick={() => setShowLogin(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={styles.button} onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div style={styles.modalBackdrop} onClick={() => setShowSignup(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Sign Up</h2>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={styles.button} onClick={handleSignup}>
              Sign Up
            </button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Crypto Exchange Platform
      </footer>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#0b0b0b",
    color: "#fff",
    padding: "2rem",
  },
  hero: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  heroTitle: { fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" },
  heroDesc: { fontSize: "1.2rem", color: "#ccc", marginBottom: "1.5rem" },
  balanceCard: {
    display: "inline-block",
    padding: "1.5rem 2rem",
    backgroundColor: "#1e1e2f",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
  },
  section: { marginBottom: "3rem" },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  horizontalScroll: {
    display: "flex",
    gap: "1rem",
    overflowX: "auto",
    paddingBottom: "1rem",
  },
  walletCard: {
    minWidth: "200px",
    backgroundColor: "#1e1e2f",
    padding: "1rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "0.2s",
  },
  marketCard: {
    minWidth: "180px",
    backgroundColor: "#1f1f2f",
    padding: "1rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "0.2s",
  },
  button: {
    padding: "0.8rem 2rem",
    backgroundColor: "#f0b90b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#000",
    transition: "0.2s",
  },
  buttonOutline: {
    padding: "0.8rem 2rem",
    backgroundColor: "transparent",
    border: "2px solid #f0b90b",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#f0b90b",
    transition: "0.2s",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#1e1e2f",
    padding: "2rem",
    borderRadius: "12px",
    width: "300px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    marginBottom: "1rem",
    borderRadius: "6px",
    border: "none",
  },
  footer: { textAlign: "center", marginTop: "4rem", color: "#777" },
};
