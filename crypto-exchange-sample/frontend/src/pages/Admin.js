import { useEffect, useState } from "react";
import API from "../api";

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await API.get("/admin/transactions");
      setData(res.data);
      setIsAdmin(true); // admin successfully fetched data
    } catch (e) {
      console.error("Admin fetch error:", e);
      if (e.response?.status === 403) {
        setIsAdmin(false); // not an admin
      } else {
        setError(e.response?.data?.error || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading admin data...</p>;
  if (!isAdmin)
    return (
      <div
        style={{
          width: "100%",
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b0b0b",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          🚫 Access Denied
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#ccc" }}>
          You are not authorized to view this page. Only admins can access the
          dashboard.
        </p>
      </div>
    );

  if (error) return <p style={{ color: "#fff" }}>{error}</p>;
  if (!data) return <p style={{ color: "#fff" }}>No data available</p>;

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
      <h1 style={{ fontSize: "2.2rem", marginBottom: "2rem" }}>
        Admin Dashboard
      </h1>

      {/* Total Balances Cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {Object.entries(data.totalBalances).length > 0 ? (
          Object.entries(data.totalBalances).map(([currency, amount]) => (
            <div
              key={currency}
              style={{
                backgroundColor: "#1f1f2f",
                padding: "1rem 1.5rem",
                borderRadius: "8px",
                minWidth: "140px",
                textAlign: "center",
                boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
                flex: "1 1 120px",
              }}
            >
              <strong>{currency}</strong>
              <p>{Number(amount).toFixed(8)}</p>
            </div>
          ))
        ) : (
          <p>No balances yet</p>
        )}
      </div>

      {/* Wallets Table */}
      <TableSection
        title="Wallets"
        data={data.wallets}
        columns={["ID", "User ID", "User Email", "Currency", "Balance"]}
        renderRow={(w, idx) => (
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
            <td style={{ padding: "12px 8px" }}>{w.id}</td>
            <td>{w.userId}</td>
            <td>{w.User?.email ?? "N/A"}</td>
            <td>{w.currency}</td>
            <td>{Number(w.balance).toFixed(8)}</td>
          </tr>
        )}
      />

      {/* Orders Table */}
      <TableSection
        title="Orders"
        data={data.orders}
        columns={[
          "ID",
          "User ID",
          "User Email",
          "Side",
          "Pair",
          "Price",
          "Amount",
          "Remaining",
          "Status",
        ]}
        renderRow={(o, idx) => (
          <tr
            key={o.id}
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
            <td>{o.id}</td>
            <td>{o.userId}</td>
            <td>{o.User?.email ?? "N/A"}</td>
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
          </tr>
        )}
      />

      {/* P2P Trades Table */}
      <TableSection
        title="P2P Trades"
        data={data.p2p}
        columns={[
          "ID",
          "Currency",
          "Amount",
          "Price",
          "Buyer ID",
          "Buyer Email",
          "Seller ID",
          "Seller Email",
          "Status",
        ]}
        renderRow={(p, idx) => {
          const bgColor = idx % 2 === 0 ? "#1f1f2f" : "#2a2a3d";
          const statusColors = {
            open: "#ffc107",
            accepted: "#17a2b8",
            completed: "#28a745",
          };
          return (
            <tr
              key={p.id}
              style={{ backgroundColor: bgColor, transition: "0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#333")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = bgColor)
              }
            >
              <td>{p.id}</td>
              <td>{p.currency}</td>
              <td>{Number(p.amount).toFixed(8)}</td>
              <td>{Number(p.price).toFixed(8)}</td>
              <td>{p.buyerId ?? "N/A"}</td>
              <td>{p.Buyer?.email ?? "N/A"}</td>
              <td>{p.sellerId ?? "N/A"}</td>
              <td>{p.Seller?.email ?? "N/A"}</td>
              <td
                style={{
                  color: "#fff",
                  backgroundColor: statusColors[p.status] || "#6c757d",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {p.status.toUpperCase()}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}

// Reusable TableSection (no changes)
function TableSection({ title, data, columns, renderRow }) {
  return (
    <div
      style={{
        backgroundColor: "#1f1f2f",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        marginBottom: "2rem",
        boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
        overflowX: "auto",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>
      <table
        style={{
          width: "100%",
          minWidth: "1200px",
          borderCollapse: "collapse",
          color: "#fff",
        }}
      >
        <thead
          style={{
            backgroundColor: "#2a2a3d",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  backgroundColor: "#2a2a3d",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "12px" }}
              >
                No data found
              </td>
            </tr>
          ) : renderRow ? (
            data.map(renderRow)
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id}
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
                {columns.map((col) => (
                  <td key={col} style={{ padding: "12px 8px" }}>
                    {row[col.toLowerCase().replace(" ", "")] ?? row[col]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
