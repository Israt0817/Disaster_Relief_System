import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Send, History, CheckCircle, Clock } from 'lucide-react';

const DonorDashboard = () => {
  const userId = localStorage.getItem('userId') || 1;
  const userName = localStorage.getItem('userName') || 'Valued Donor'; 

  // ট্যাব স্টেট ম্যানেজমেন্ট ('money' বা 'items')
  const [activeTab, setActiveTab] = useState('money');

  // মানি ডোনেশন ফর্ম স্টেট
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');

  // আইটেম ডোনেশন ফর্ম স্টেট
  const [itemCategory, setItemCategory] = useState('Food');
  const [itemDetails, setItemDetails] = useState('');
  const [quantity, setQuantity] = useState('');

  // হিস্ট্রি বা লগ স্টেট
  const [moneyHistory, setMoneyHistory] = useState([]);
  const [itemHistory, setItemHistory] = useState([]);

  // ডেটা লোড করার আলাদা ফাংশন (ফরম সাবমিশনের পর রিফ্রেশ করার জন্য)
  const refreshHistory = async () => {
    try {
      const moneyRes = await fetch(`http://localhost:5000/api/donations/user/${userId}`);
      if (moneyRes.ok) {
        const moneyData = await moneyRes.json();
        setMoneyHistory(moneyData);
      }

      const itemRes = await fetch(`http://localhost:5000/api/donations/item-user/${userId}`);
      if (itemRes.ok) {
        const itemData = await itemRes.json();
        setItemHistory(itemData);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  // FIXED: Moved the initialization fetch logic inside useEffect to resolve the eslint warning perfectly
  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        const moneyRes = await fetch(`http://localhost:5000/api/donations/user/${userId}`);
        if (moneyRes.ok) {
          const moneyData = await moneyRes.json();
          setMoneyHistory(moneyData);
        }

        const itemRes = await fetch(`http://localhost:5000/api/donations/item-user/${userId}`);
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          setItemHistory(itemData);
        }
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    fetchDonationHistory();
  }, [userId]);

  // টাকা ডোনেশন সাবমিট হ্যান্ডলার
  const handleMoneySubmit = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    if (!transactionId.trim()) {
      alert("Please enter the payment Transaction ID (TrxID) for verification.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/donations/manual-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          transaction_id: transactionId.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(data.message || "Your donation transaction has been successfully sent for verification!");
        setAmount('');
        setTransactionId('');
        refreshHistory(); // Updates ledger table instantly
      } else {
        alert(data.message || "Failed to record transaction verification payload details.");
      }
    } catch (err) {
      console.error("Manual transaction logging network error:", err);
      alert("Server connection error or network timeout.");
    }
  };

  // আইটেম ডোনেশন সাবমিট হ্যান্ডলার
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/donations/item-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_category: itemCategory,
          item_details: itemDetails,
          quantity
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Wonderful! Item donation registered. Our team will collect it soon.");
        setItemDetails('');
        setQuantity('');
        refreshHistory(); // টেবিল রিফ্রেশ
      } else {
        alert(data.message || "Item submission failed");
      }
    } catch (err) {
      alert("Server connection error.");
    }
  };

  return (
    <div style={{ padding: '30px', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* হেডার */}
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Welcome, {userName}!</h1>
        <p style={{ color: '#a1a1aa', marginTop: '6px' }}>Your regular contributions keep our relief pipelines flowing securely.</p>
      </div>

      {/* ট্যাব সিলেকশন বাটনসমূহ */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('money')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'money' ? '#a855f7' : 'transparent',
            border: activeTab === 'money' ? '1px solid #a855f7' : '1px solid #333',
            color: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <DollarSign size={18} /> Donate Money
        </button>

        <button 
          onClick={() => setActiveTab('items')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'items' ? '#a855f7' : 'transparent',
            border: activeTab === 'items' ? '1px solid #a855f7' : '1px solid #333',
            color: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Package size={18} /> Donate Items (Food, Clothes)
        </button>
      </div>

      {/* ড্যাশবোর্ড কন্টেন্ট গ্রিড */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* বাম পাশ: ডায়নামিক ফর্ম */}
        <div style={{ background: '#121214', border: '1px solid #27272a', padding: '24px', borderRadius: '16px' }}>
          
          {activeTab === 'money' ? (
            <form onSubmit={handleMoneySubmit}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#a855f7' }}>Fund Contribution Secure Portal</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Amount (BDT)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 1000" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Payment Gateway</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                  <option value="bKash">bKash (017XXXXXXXX)</option>
                  <option value="Nagad">Nagad (017XXXXXXXX)</option>
                  <option value="Rocket">Rocket (017XXXXXXXX)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Transaction ID (TrxID)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 01712238780" 
                  required 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button type="submit" style={btnStyle}>
                <Send size={16} /> Disburse Donation Funds
              </button>
            </form>
          ) : (
            <form onSubmit={handleItemSubmit}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#a855f7' }}>Material Relief Item Registration</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Item Category</label>
                <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} style={inputStyle}>
                  <option value="Food">Food (Rice, Pulse, Dry Snacks)</option>
                  <option value="Cloth">Cloth (Winter Wear, Shirts, Pants)</option>
                  <option value="Medicine">Medicine (First Aid, ORS, Paracetamol)</option>
                  <option value="Blanket">Blanket / Bedding</option>
                  <option value="Others">Others / Mixed Relief Kits</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Item Details & Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20 KG Miniket Rice, 5 Winter Jackets" 
                  required 
                  value={itemDetails}
                  onChange={(e) => setItemDetails(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px', fontSize: '0.9rem' }}>Total Quantity (Units / Packages)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5" 
                  required 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button type="submit" style={btnStyle}>
                <Package size={16} /> Register Items for Collection
              </button>
            </form>
          )}

        </div>

        {/* ডান পাশ: লাইভ হিস্ট্রি বা লগ টেবিল */}
        <div style={{ background: '#121214', border: '1px solid #27272a', padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
            <History size={18} /> Live Contribution Ledgers
          </h3>

          {activeTab === 'money' ? (
            /* MONEY HISTORY TABLE */
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#a855f7', fontSize: '0.95rem' }}>Your Financial Contribution History</h4>
              {moneyHistory.length === 0 ? (
                <p style={{ color: '#52525b', fontSize: '0.9rem' }}>No monetary transaction registries found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #27272a', textAlign: 'left' }}>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>Method</th>
                        <th style={thStyle}>Transaction ID</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moneyHistory.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #1c1c1f' }}>
                          <td style={{ ...tdStyle, fontWeight: '700', color: '#22c55e' }}>{row.amount} TK</td>
                          <td style={tdStyle}>{row.payment_method}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{row.transaction_id || row.trx_id}</td>
                          <td style={tdStyle}>
                            <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ITEM HISTORY TABLE */
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#a855f7', fontSize: '0.95rem' }}>Your Relief Material Donation History</h4>
              {itemHistory.length === 0 ? (
                <p style={{ color: '#52525b', fontSize: '0.9rem' }}>No item contribution records found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #27272a', textAlign: 'left' }}>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemHistory.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #1c1c1f' }}>
                          <td style={{ ...tdStyle, fontWeight: '600' }}>{row.item_category}</td>
                          <td style={tdStyle}>{row.item_details}</td>
                          <td style={tdStyle}>{row.quantity} Pcs</td>
                          <td style={tdStyle}>
                            <span style={{ 
                              color: row.status === 'pending' ? '#eab308' : '#22c55e', 
                              background: row.status === 'pending' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)', 
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {row.status === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// সিএসএস ইনলাইন স্টাইলসমূহ
const inputStyle = {
  width: '100%',
  padding: '12px',
  background: '#1c1c1f',
  border: '1px solid #27272a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  marginTop: '4px'
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  background: '#a855f7',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '10px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem',
  marginTop: '10px'
};

const thStyle = {
  padding: '10px 8px',
  color: '#71717a',
  fontWeight: '600',
  fontSize: '0.85rem'
};

const tdStyle = {
  padding: '12px 8px',
  color: '#e4e4e7'
};

export default DonorDashboard;