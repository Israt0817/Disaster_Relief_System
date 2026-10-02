import React, { useState, useEffect } from 'react';
import { Package, UserCheck, Check, Clock, Truck } from 'lucide-react';

const DonorItemsReview = () => {
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState({}); // ট্র্যাক করবে কোন রো-তে কোন ভলান্টিয়ার সিলেক্ট হলো

  // ডেটা লোড করা
  const loadData = async () => {
    try {
      // ১. ডোনারদের আইটেম রিকোয়েস্ট লোড
      const itemRes = await fetch('http://localhost:5000/api/admin/item-donations');
      if (itemRes.ok) {
        const rawData = await itemRes.json();
        
        // [FIXED] ডাটাবেজে যদি ভুলবশত বা পূর্বে কোনো রো-তে status NULL বা ফাঁকা থাকে, 
        // তবে ফ্রন্টঅ্যান্ড ক্র্যাশ না করে সেটিকে ডিফল্ট 'pending' হিসেবে ধরে নিবে।
        const normalizedData = rawData.map(item => ({
          ...item,
          status: (item.status && item.status.trim() !== "") ? item.status.toLowerCase() : 'pending'
        }));
        
        setRequests(normalizedData);
      }

      // ২. ভলান্টিয়ারদের লিস্ট লোড
      const volRes = await fetch('http://localhost:5000/api/admin/active-volunteers');
      if (volRes.ok) setVolunteers(await volRes.json());
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ভলান্টিয়ার অ্যাসাইন হ্যান্ডলার
  const handleAssign = async (id) => {
    const volunteerId = selectedVolunteers[id];
    if (!volunteerId) {
      alert("Please select a volunteer from the dropdown first.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/item-donations/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: parseInt(volunteerId, 10) })
      });

      if (res.ok) {
        alert("Volunteer dispatched for pickup!");
        loadData(); // রিয়েল-টাইম রিফ্রেশ
      } else {
        alert("Server validation error while assigning agent.");
      }
    } catch (err) {
      alert("Error assigning volunteer.");
    }
  };

  // ফাইনাল স্টক-ইন/কালেক্ট হ্যান্ডলার (ক্যাম্পে মাল পৌঁছানোর পর)
  const handleCollect = async (id) => {
    if (!window.confirm("Verify goods received at warehouse? This will instantly credit your Main Inventory.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/item-donations/${id}/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert("Success! Items successfully sorted and added to live Inventory.");
        loadData();
      }
    } catch (err) {
      alert("Error updating inventory.");
    }
  };

  return (
    <div style={{ padding: '30px', color: '#fff' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Relief Logistics & Collection Center</h1>
        <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Assign field agents to collect physical assets from donor locations and log them into storage.</p>
      </div>

      <div style={{ background: '#121214', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#1c1c1f', borderBottom: '1px solid #27272a' }}>
              <th style={thStyle}>Donor</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Item Specs</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Logistics / Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#52525b' }}>No goods in collection pipeline.</td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1c1c1f' }}>
                  <td style={tdStyle}>{item.donor_name}</td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#a855f7' }}>{item.item_category}</td>
                  <td style={tdStyle}>{item.item_details}</td>
                  <td style={tdStyle}>{item.quantity} Pcs</td>
                  
                  {/* স্ট্যাটাস ব্যাজ */}
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      background: item.status === 'pending' ? 'rgba(234,179,8,0.1)' : item.status === 'assigned' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
                      color: item.status === 'pending' ? '#eab308' : item.status === 'assigned' ? '#3b82f6' : '#22c55e',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {item.status === 'pending' && <Clock size={12} />}
                      {item.status === 'assigned' && <Truck size={12} />}
                      {item.status === 'collected' && <Check size={12} />}
                      {item.status}
                    </span>
                  </td>

                  {/* ডায়নামিক অ্যাকশন বাটন */}
                  <td style={tdStyle}>
                    {item.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select 
                          onChange={(e) => setSelectedVolunteers({...selectedVolunteers, [item.id]: e.target.value})}
                          style={selectStyle}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Courier...</option>
                          {volunteers.map(v => <option key={v.id} value={v.id}>{v.full_name}</option>)}
                        </select>
                        <button onClick={() => handleAssign(item.id)} style={{ ...btnStyle, background: '#3b82f6' }}>
                          <UserCheck size={14} /> Assign Agent
                        </button>
                      </div>
                    )}

                    {item.status === 'assigned' && (
                      <button onClick={() => handleCollect(item.id)} style={{ ...btnStyle, background: '#22c55e' }}>
                        <Package size={14} /> Receive & Stock In
                      </button>
                    )}

                    {item.status === 'collected' && (
                      <span style={{ color: '#52525b', fontSize: '0.85rem', fontWeight: '500' }}>Stored in Main Warehouse</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '14px', color: '#71717a', fontSize: '0.85rem', fontWeight: '600' };
const tdStyle = { padding: '14px', color: '#e4e4e7', fontSize: '0.9rem' };
const selectStyle = { padding: '6px 10px', background: '#1c1c1f', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' };
const btnStyle = { color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' };

export default DonorItemsReview;