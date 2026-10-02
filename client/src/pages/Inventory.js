import React, { useState, useEffect } from "react";
import { Package, AlertTriangle, Plus, X } from "lucide-react";

const Inventory = () => {
  const [supplies, setSupplies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Food",
    quantity: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/inventory");
      if (response.ok) {
        const data = await response.json();
        setSupplies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching inventory from MySQL:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adminId = localStorage.getItem("userId") || 1;

    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10) || 0,
      adminId: parseInt(adminId, 10),
    };

    try {
      const response = await fetch("http://localhost:5000/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchInventory();
        setShowForm(false);
        setFormData({ name: "", category: "Food", quantity: "" });
      } else {
        alert(
          "Server encountered an error saving data to MySQL. Check server logs.",
        );
      }
    } catch (err) {
      console.error("Network error connecting to Node server:", err);
      alert(
        "Could not reach backend server. Make sure your server terminal is running!",
      );
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#09090b",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h2
            className="gradient-text"
            style={{
              margin: 0,
              fontSize: "2.2rem",
              fontWeight: "700",
              color: "#fff",
            }}
          >
            ResQ Inventory
          </h2>
          <p style={{ color: "#a1a1aa", marginTop: "5px" }}>
            Your little contribution can make a big difference!☺️
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            background: "#a855f7",
            color: "white",
            border: "none",
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}{" "}
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </header>

      {showForm && (
        <div
          style={{
            width: "100%",
            marginBottom: "30px",
            background: "#121214",
            border: "1px solid #27272a",
            padding: "24px",
            borderRadius: "16px",
            boxSizing: "border-box",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "2", minWidth: "240px" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  marginBottom: "8px",
                }}
              >
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                required
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Oxygen"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#09090b",
                  color: "white",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: "1", minWidth: "160px" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  marginBottom: "8px",
                }}
              >
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                style={{
                  padding: "12px",
                  background: "#09090b",
                  color: "white",
                  borderRadius: "8px",
                  border: "1px solid #27272a",
                  width: "100%",
                  height: "45px",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Water">Water</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
            <div style={{ flex: "1", minWidth: "120px" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  marginBottom: "8px",
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                required
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#09090b",
                  color: "white",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                height: "45px",
                padding: "0 32px",
                fontWeight: "700",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#a855f7",
                color: "white",
                border: "none",
              }}
            >
              Save to DB
            </button>
          </form>
        </div>
      )}

      <div
        style={{
          background: "#121214",
          borderRadius: "20px",
          border: "1px solid #27272a",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #27272a",
                color: "#a1a1aa",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <th style={{ padding: "20px" }}>Item Name</th>
              <th style={{ padding: "20px" }}>Category</th>
              <th style={{ padding: "20px" }}>Quantity</th>
              <th style={{ padding: "20px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {supplies && supplies.length > 0 ? (
              supplies.map((item, index) => {
                const itemName = item.name || "N/A";
                const itemCategory = item.category || "Food";
                const itemQuantity =
                  item.quantity !== undefined ? item.quantity : 0;
                const itemId = item.id || index;

                return (
                  <tr
                    key={itemId}
                    style={{ borderBottom: "1px solid #27272a" }}
                  >
                    <td style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#fff",
                        }}
                      >
                        <Package size={18} color="#a855f7" />
                        {itemName}
                      </div>
                    </td>
                    <td style={{ padding: "20px", color: "#a1a1aa" }}>
                      {itemCategory}
                    </td>
                    <td
                      style={{
                        padding: "20px",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      {itemQuantity}
                    </td>
                    <td style={{ padding: "20px" }}>
                      <span
                        style={{
                          color: itemQuantity < 10 ? "#ff4d4d" : "#00ff88",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {itemQuantity < 10 && <AlertTriangle size={16} />}
                        {itemQuantity < 10 ? "CRITICAL" : "IN STOCK"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#a1a1aa",
                    fontSize: "1.05rem",
                  }}
                >
                  No products found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
