import { useState, useEffect } from "react";
import API from "../api";

export default function P2P() {
  const [offers, setOffers] = useState([]);
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [tab, setTab] = useState("sell"); // sell / buy
  const [amount, setAmount] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const userId = parseInt(localStorage.getItem("userId")); // logged-in user ID

  // Load all offers
  const loadOffers = async () => {
    try {
      const res = await API.get("/p2p/offers");
      setOffers(res.data);
    } catch (err) {
      console.error("Failed to load offers:", err);
    }
  };

  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Create a new sell offer
  const createOffer = async () => {
    if (!amount) return alert("Enter amount");
    try {
      await API.post("/p2p/offer", {
        amount: parseFloat(amount),
        currency: currencyFilter,
        userId, // pass userId of creator
      });
      setAmount("");
      loadOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create offer");
    }
  };

  // Accept an offer
  const acceptOffer = async (tradeId, sellerId) => {
    if (sellerId === userId) return alert("Cannot accept your own trade");
    if (!window.confirm("Are you sure you want to accept this offer?")) return;
    try {
      await API.post("/p2p/accept", { tradeId, buyerId: userId });
      loadOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept offer");
    }
  };

  // Complete trade
  const completeTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to complete this trade?"))
      return;
    try {
      await API.post("/p2p/complete", { tradeId, userId });
      loadOffers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to complete trade");
    }
  };

  const filteredOffers = offers.filter(
    (o) =>
      (tab === "sell"
        ? o.sellerId === userId || o.status !== "completed"
        : o.buyerId === userId || o.status !== "completed") &&
      (currencyFilter === "ALL" || o.currency === currencyFilter)
  );

  const statusColor = (status) =>
    status === "open"
      ? "#28a745"
      : status === "accepted"
      ? "#ffc107"
      : "#6c757d";

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "1rem 2rem 2rem 2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0b0b0b",
        color: "#fff",
      }}
    >
      <h1 style={{ marginBottom: 20, fontSize: "2.5rem", fontWeight: "bold" }}>
        P2P Marketplace
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setTab("sell")}
          style={{
            padding: "10px 20px",
            fontWeight: tab === "sell" ? "bold" : "normal",
            backgroundColor: tab === "sell" ? "#28a745" : "#1f1f2f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Sell Offers
        </button>
        <button
          onClick={() => setTab("buy")}
          style={{
            padding: "10px 20px",
            fontWeight: tab === "buy" ? "bold" : "normal",
            backgroundColor: tab === "buy" ? "#007bff" : "#1f1f2f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Buy Offers
        </button>
      </div>

      {/* Filters + Create Offer */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          style={{
            padding: 10,
            backgroundColor: "#1f1f2f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
          }}
        >
          <option value="ALL">All Currencies</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>

        {tab === "sell" && (
          <>
            <input
              type="number"
              placeholder={`Amount to sell`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                padding: 10,
                flex: 1,
                minWidth: "200px",
                backgroundColor: "#1f1f2f",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            />
            <button
              onClick={createOffer}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Create Offer
            </button>
          </>
        )}
      </div>

      {/* Offers Table */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.5fr 2fr 2fr 1fr 1fr 1fr 1fr",
            padding: "12px 16px",
            fontWeight: "bold",
            color: "#fff",
            borderBottom: "2px solid #2a2a3d",
            backgroundColor: "#1f1f2f",
          }}
        >
          <div></div>
          <div>Seller Email</div>
          <div>Buyer Email</div>
          <div>Amount</div>
          <div>Currency</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {filteredOffers.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#ccc" }}>
            No offers found
          </div>
        )}

        {filteredOffers.map((o) => (
          <div key={o.id}>
            {/* Main Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.5fr 2fr 2fr 1fr 1fr 1fr 1fr",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: 10,
                backgroundColor: "#1f1f2f",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onClick={() => toggleExpand(o.id)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2a2a3d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#1f1f2f")
              }
            >
              <div style={{ fontWeight: "bold" }}>
                {expandedIds.includes(o.id) ? "▼" : "▶"}
              </div>
              <div style={{ color: "#28a745", fontWeight: "bold" }}>
                {o.Seller?.email}
              </div>
              <div style={{ color: "#17a2b8", fontWeight: "bold" }}>
                {o.Buyer ? o.Buyer.email : "-"}
              </div>
              <div>{o.amount}</div>
              <div>{o.currency}</div>
              <div style={{ color: statusColor(o.status), fontWeight: "bold" }}>
                {o.status.toUpperCase()}
              </div>
              <div>
                {o.status === "open" && o.sellerId !== userId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptOffer(o.id, o.sellerId);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Accept
                  </button>
                )}
                {o.status === "accepted" &&
                  (o.sellerId === userId || o.buyerId === userId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeTrade(o.id);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Complete
                    </button>
                  )}
                {o.status === "completed" && (
                  <span style={{ color: "#6c757d" }}>Completed</span>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedIds.includes(o.id) && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#2a2a3d",
                  borderRadius: "0 0 10px 10px",
                  color: "#fff",
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <strong>Trade ID:</strong> {o.id}
                </div>
                <div>
                  <strong>Seller:</strong> {o.Seller?.email}
                </div>
                <div>
                  <strong>Buyer:</strong> {o.Buyer ? o.Buyer.email : "-"}
                </div>
                <div>
                  <strong>Amount:</strong> {o.amount}
                </div>
                <div>
                  <strong>Currency:</strong> {o.currency}
                </div>
                <div>
                  <strong>Status:</strong> {o.status}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
