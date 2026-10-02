const express = require("express");
const cors = require("cors");
const db = require("./db");
const SSLCommerzPayment = require("sslcommerz-lts");
require("dotenv").config();

const app = express();

// Essential parsing middlewares
app.use(cors());
// Crucial: SSLCommerz sends callbacks as application/x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- HELPER: AUDIT LOGGER ---
const logAction = async (
  adminId,
  actionType,
  targetId = null,
  oldVal = null,
  newVal = null,
) => {
  try {
    const validAdminId = adminId ? parseInt(adminId, 10) : 1;
    const sql =
      "INSERT INTO audit_logs (admin_id, action_type, target_id, old_value, new_value) VALUES (?, ?, ?, ?, ?)";
    await db.query(sql, [validAdminId, actionType, targetId, oldVal, newVal]);
  } catch (err) {
    console.error("Audit log failed but action was saved:", err);
  }
};

// --- 1. DISASTERS ROUTE ---
app.get("/api/disasters", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM disasters");
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- 2. REGISTRATION ROUTE (UPDATED TO STORE PHONE NUMBER) ---
app.post("/api/register", async (req, res) => {
  const { full_name, email, phone_number, password, role } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Registration failed. Email already exists." });
    }

    const targetRole = role === "donor" ? "donor" : "pending";
    const sql =
      "INSERT INTO users (full_name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      full_name,
      email,
      phone_number,
      password,
      targetRole,
    ]);

    res.status(201).json({
      message: "Registered successfully!",
      userId: result.insertId,
      role: targetRole,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// --- 3. LOGIN ROUTE ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const sql =
      "SELECT id, full_name, role FROM users WHERE email = ? AND password = ?";
    const [rows] = await db.query(sql, [email, password]);

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// --- 4. VOLUNTEER MANAGEMENT ROUTES ---
app.get("/api/volunteers", async (req, res) => {
  try {
    const sql = `
            SELECT 
                u.id, u.full_name, u.email, u.role, 
                COALESCE(u.phone_number, vs.phone_number) AS phone_number, vs.age, vs.profession, vs.blood_group, 
                vs.availability, vs.primary_skills, vs.prior_experience, 
                vs.medical_conditions, vs.emergency_contact 
            FROM users u
            LEFT JOIN volunteer_submissions vs ON u.id = vs.user_id
            WHERE u.role IN ('volunteer', 'pending')`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res
      .status(500)
      .json({ message: "Error fetching extensive volunteer records." });
  }
});

app.patch("/api/volunteers/:id", async (req, res) => {
  const { id } = req.params;
  const { role, adminId } = req.body;
  try {
    const [user] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
    const oldRole = user[0]?.role;

    const sql = "UPDATE users SET role = ? WHERE id = ?";
    await db.query(sql, [role, id]);

    await logAction(adminId, "VOLUNTEER_STATUS_UPDATE", id, oldRole, role);

    res.json({ message: `User status updated to ${role}` });
  } catch (err) {
    console.error("Patch error processing:", err);
    res.status(500).json({ message: "Error updating status" });
  }
});

// --- 5. VOLUNTEER VERIFICATION SUBMISSION ---
app.post("/api/volunteers/verify", async (req, res) => {
  const {
    user_id,
    phone_number,
    age,
    profession,
    blood_group,
    availability,
    primary_skills,
    prior_experience,
    medical_conditions,
    emergency_contact,
  } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT id FROM volunteer_submissions WHERE user_id = ?",
      [user_id],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({
          message: "Verification application has already been submitted.",
        });
    }

    const sql = `INSERT INTO volunteer_submissions 
                     (user_id, phone_number, age, profession, blood_group, availability, primary_skills, prior_experience, medical_conditions, emergency_contact) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.query(sql, [
      user_id,
      phone_number,
      age,
      profession,
      blood_group,
      availability,
      primary_skills,
      prior_experience,
      medical_conditions,
      emergency_contact,
    ]);

    res
      .status(201)
      .json({
        success: true,
        message:
          "Onboarding questionnaire recorded cleanly into system registries.",
      });
  } catch (err) {
    console.error("Verification route error:", err);
    res
      .status(500)
      .json({ message: "Database failure recording comprehensive form data." });
  }
});

// --- 6. INVENTORY ROUTES ---
app.get("/api/inventory", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, item_name AS name, category, quantity, unit, last_updated FROM inventory ORDER BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

app.post("/api/inventory", async (req, res) => {
  const { name, category, quantity, adminId } = req.body;

  if (!name || !category || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "Missing required fields (name, category, quantity)" });
  }

  try {
    const sql =
      "INSERT INTO inventory (item_name, category, quantity) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [
      name,
      category,
      parseInt(quantity, 10),
    ]);

    try {
      const validAdminId = adminId ? parseInt(adminId, 10) : 1;
      const logSql =
        "INSERT INTO audit_logs (admin_id, action_type, target_id, old_value, new_value) VALUES (?, ?, ?, ?, ?)";
      await db.query(logSql, [
        validAdminId,
        "INVENTORY_ADD",
        result.insertId,
        null,
        `${quantity} units of ${name}`,
      ]);
    } catch (auditErr) {
      console.warn(
        "⚠️ Audit log Entry Failed, but inventory item saved successfully:",
        auditErr.message,
      );
    }

    res
      .status(201)
      .json({
        id: result.insertId,
        name,
        category,
        quantity,
        message: "Item added successfully",
      });
  } catch (err) {
    console.error("🔴 MySQL Insert Error:", err);
    res
      .status(500)
      .json({ message: "Error saving item to database", error: err.message });
  }
});

// --- 7. DASHBOARD SUMMARY ROUTE ---
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [volCount] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'volunteer'",
    );
    const [invCount] = await db.query(
      "SELECT SUM(quantity) as total FROM inventory",
    );
    const [disasterCount] = await db.query(
      "SELECT COUNT(*) as total FROM disasters",
    );
    res.json({
      volunteers: volCount[0].total,
      inventory: invCount[0].total || 0,
      disasters: disasterCount[0].total,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

// --- 8. AUDIT LOGS RETRIEVAL ---
app.get("/api/logs", async (req, res) => {
  try {
    const sql = `
            SELECT al.*, u.full_name as admin_name 
            FROM audit_logs al 
            LEFT JOIN users u ON al.admin_id = u.id 
            ORDER BY al.timestamp DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

// --- 9. MAP SPECIFIC DATA ---
app.get("/api/map/incidents", async (req, res) => {
  try {
    const sql =
      "SELECT id, title, latitude, longitude, type, severity FROM disasters";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching map incidents" });
  }
});

// =========================================================================
// --- 10. REAL-TIME VICTIM SOS & PIPELINE INTEGRATION ---
// =========================================================================

app.post("/api/sos/request", async (req, res) => {
  const { request_type, people_count, lat, lng, victim_name, phone, description } = req.body;
  try {
    const sql = `INSERT INTO sos_requests 
            (victim_name, phone, request_type, people_count, location_lat, location_lng, description, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`;
    
    await db.query(sql, [
      victim_name || "Anonymous Victim",
      phone || "No Number",
      request_type || "URGENT RESCUE REQUIRED",
      people_count || 1,
      lat || 23.8103,
      lng || 90.4125,
      description || ""
    ]);

    res.status(201).json({ success: true, message: "SOS signal broadcasted successfully." });
  } catch (err) {
    console.error("SOS Trigger Error:", err);
    res.status(500).json({ message: "Error broadcasting SOS signal" });
  }
});

app.get("/api/admin/sos-list", async (req, res) => {
  try {
    const sql = "SELECT id, victim_name, phone, request_type, people_count, location_lat, location_lng, description, status FROM sos_requests ORDER BY id DESC";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching SOS records:", err);
    res.status(500).json([]);
  }
});

const handleDispatchAndApprove = async (req, res) => {
  const { id } = req.params;
  const { dispatched_service } = req.body;
  const adminId = req.body.adminId || 1;

  try {
    const [sosRequest] = await db.query("SELECT * FROM sos_requests WHERE id = ?", [id]);
    if (sosRequest.length === 0) {
      return res.status(404).json({ success: false, message: "SOS record not found." });
    }

    const originalRequest = sosRequest[0];
    const targetStatus = "Dispatched";

    await db.query("UPDATE sos_requests SET status = ? WHERE id = ?", [targetStatus, id]);

    const [disasterRows] = await db.query("SELECT id FROM disasters LIMIT 1");
    let safeDisasterId = null;
    
    if (disasterRows.length > 0) {
      safeDisasterId = disasterRows[0].id;
    } else {
      const [newDisaster] = await db.query(
        "INSERT INTO disasters (title, description, type, severity, latitude, longitude) VALUES ('General Emergency Hub', 'System-generated parent container for processing isolated citizen emergency calls.', 'GENERAL', 'High', ?, ?)",
        [originalRequest.location_lat || 23.8103, originalRequest.location_lng || 90.4125]
      );
      safeDisasterId = newDisaster.insertId;
    }

    const missionTitle = `${originalRequest.request_type || 'Urgent Rescue'} (${dispatched_service || 'Field Unit'})`;
    const missionDesc = `🚨 DISPATCH ORDER AUTHORIZED: [${dispatched_service || 'Emergency Crew'} Assigned].\n\n` +
                        `Victim Profile: ${originalRequest.victim_name} (${originalRequest.phone || 'No Number'})\n` +
                        `People Count: ${originalRequest.people_count}\n` +
                        `Situation Notes: ${originalRequest.description || 'No data provided.'}\n\n` +
                        `Geo-Vector Coordinates: Lat ${originalRequest.location_lat}, Lng ${originalRequest.location_lng}`;
    const reqVolunteers = 5; 

    const sqlInsert = `
      INSERT INTO missions (disaster_id, title, description, required_volunteers, status, sos_reference_id) 
      VALUES (?, ?, ?, ?, 'open', ?)
    `;
    const [missionResult] = await db.query(sqlInsert, [
      safeDisasterId,
      missionTitle,
      missionDesc,
      parseInt(reqVolunteers, 10),
      originalRequest.id
    ]);

    try {
      await logAction(adminId, "SOS_CONVERTED_TO_MISSION", originalRequest.id, "Pending", targetStatus);
    } catch (auditErr) {
      console.warn("Audit logging skipped.");
    }

    res.status(200).json({
      success: true,
      message: "SOS request updated successfully and deployment pushed to volunteer dashboard!",
      missionId: missionResult.insertId,
      status: targetStatus
    });
  } catch (err) {
    console.error("🔴 SOS Conversion Process Failure:", err);
    res.status(500).json({ success: false, message: "Database failure transforming request into mission row.", error: err.message });
  }
};

app.patch("/api/admin/sos/:id/dispatch", handleDispatchAndApprove);
app.patch("/api/admin/sos/:id/approve", handleDispatchAndApprove);

app.get("/api/missions/active", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM missions WHERE status IN ('open', 'ongoing') ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error loading operational missions list." });
  }
});

app.post("/api/missions/join", async (req, res) => {
  const { mission_id, volunteer_id } = req.body;

  if (!mission_id || !volunteer_id) {
    return res.status(400).json({ success: false, message: "Missing tracking identification metrics." });
  }

  try {
    const [duplicate] = await db.query(
      "SELECT id FROM volunteer_missions WHERE mission_id = ? AND volunteer_id = ?",
      [mission_id, volunteer_id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ success: false, message: "You have already joined this rescue mission squad!" });
    }

    await db.query(
      "INSERT INTO volunteer_missions (mission_id, volunteer_id) VALUES (?, ?)",
      [mission_id, volunteer_id]
    );

    res.status(201).json({ success: true, message: "Successfully deployed onto the active rescue mission roster!" });
  } catch (err) {
    console.error("Mission Roster Join Error:", err);
    res.status(500).json({ success: false, message: "Database failure linking tracking IDs." });
  }
});

// --- VOLUNTEER SOS STREAM REAL-TIME ENDPOINTS ---
app.get("/api/sos-requests", async (req, res) => {
  try {
    const sql = "SELECT id, victim_name, phone, request_type, people_count, location_lat, location_lng, description, status, created_at FROM sos_requests WHERE LOWER(status) = 'pending' ORDER BY id DESC";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Volunteer Live SOS fetch error:", err);
    res.status(500).json({ message: "Database link broken." });
  }
});

app.patch("/api/sos-requests/:id/intercept", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  
  try {
    const sql = "UPDATE sos_requests SET status = ? WHERE id = ?";
    const [result] = await db.query(sql, [status || 'Dispatched', id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Beacon record not found." });
    }
    
    res.json({ success: true, message: "Mission payload successfully locked down and updated!" });
  } catch (err) {
    console.error("Volunteer intercept database write error:", err);
    res.status(500).json({ success: false, message: "Database write failure." });
  }
});


// =========================================================================
// --- 11. DONOR & SSLCOMMERZ CASH DONATION INTEGRATION CORE ---
// =========================================================================

app.get("/api/donations", async (req, res) => {
  try {
    const sql = `
      SELECT t.*, u.full_name, u.email 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.id DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ message: "Error fetching donations" });
  }
});

app.get("/api/donations/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC";
    const [rows] = await db.query(sql, [userId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user donations:", err);
    res.status(500).json({ message: "Error fetching user donation history" });
  }
});

// --- NEW ROUTE: LOG MANUAL FORM TRANSACTIONS (bKash/Nagad Text Fields) ---
app.post("/api/donations/manual-submit", async (req, res) => {
  const { user_id, amount, payment_method, transaction_id } = req.body;

  if (!user_id || !amount || !transaction_id) {
    return res.status(400).json({ success: false, message: "Missing required parameters." });
  }

  try {
    // Inserts details cleanly conforming with standard blueprint fields
    const sql = `
      INSERT INTO transactions 
      (user_id, amount, payment_method, transaction_id, type, status) 
      VALUES (?, ?, ?, ?, 'donation', 'success')
    `;
    
    const [result] = await db.query(sql, [
      user_id, 
      parseFloat(amount), 
      payment_method || "bKash", 
      transaction_id
    ]);

    try {
      await logAction(1, "MANUAL_DONATION_LOGGED", result.insertId, null, `Logged ${amount} BDT manually. TrxID: ${transaction_id}`);
    } catch (auditErr) {
      console.warn("Audit tracking skipped.");
    }

    return res.status(201).json({ 
      success: true, 
      message: "Your donation has been manually recorded for administrative verification!" 
    });

  } catch (err) {
    console.error("🔴 Manual Transaction Processing Error:", err);
    return res.status(500).json({ success: false, message: "Database execution failure processing manual entries." });
  }
});

// A. Step 1: Initialize SSLCommerz gateway session redirect
app.post("/api/donations/submit", async (req, res) => {
  const { user_id, amount, payment_method } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ message: "Missing required tracking metrics." });
  }

  // Create a clean unique session order transaction reference tracking key string
  const customInvoiceId = "INVC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

  // Prefetch client metadata structures to satisfy transaction schema constraints cleanly
  let clientName = "ResQ Supporter";
  let clientEmail = "donor@resq-hub.org";

  try {
    const [userRows] = await db.query("SELECT full_name, email FROM users WHERE id = ?", [user_id]);
    if (userRows.length > 0) {
      clientName = userRows[0].full_name;
      clientEmail = userRows[0].email;
    }
  } catch (dbErr) {
    console.warn("User matching failed, falling back to defaults.");
  }

  // Build the complete initialization data schema parameter object package
  const sslData = {
    total_amount: parseFloat(amount),
    currency: "BDT",
    tran_id: customInvoiceId,
    // Callback return routers bound back directly to our server core instance
    success_url: `http://localhost:5000/api/payment/success?invoice=${customInvoiceId}&uid=${user_id}&method=${payment_method || "Online"}`,
    fail_url: "http://localhost:5000/api/payment/fail",
    cancel_url: "http://localhost:5000/api/payment/cancel",
    ipn_url: "http://localhost:5000/api/payment/ipn",
    shipping_method: "No",
    product_name: "Emergency Disaster Relief Donation",
    product_category: "Philanthropy",
    product_profile: "non-physical-goods",
    cus_name: clientName,
    cus_email: clientEmail,
    cus_add1: "Dhaka, Bangladesh",
    cus_phone: "01700000000",
    cus_city: "Dhaka",
    cus_country: "Bangladesh"
  };

  const sslcommerz = new SSLCommerzPayment(
    process.env.STORE_ID,
    process.env.STORE_PASSWORD,
    process.env.IS_SANDBOX === "true"
  );

  sslcommerz.init(sslData).then((sslRes) => {
    if (sslRes?.GatewayPageURL) {
      // Return URL target string directly so your front-end react window can redirect to bKash/Nagad
      res.json({ success: true, GatewayPageURL: sslRes.GatewayPageURL });
    } else {
      res.status(400).json({ message: "Failed to construct SSLCommerz checkout window pipeline." });
    }
  }).catch((err) => {
    console.error("SSLCommerz Integration Error:", err);
    res.status(500).json({ message: "Gateway connection failure." });
  });
});

// B. Step 2: SSLCommerz success response redirect callback handler loop
app.post("/api/payment/success", async (req, res) => {
  const { invoice, uid, method } = req.query;
  const { bank_tran_id, amount } = req.body; // SSLCommerz outputs bank parameters via body

  try {
    const sql = "INSERT INTO transactions (user_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, 'success')";
    const [result] = await db.query(sql, [uid, amount, method || "SSLCommerz Channel", bank_tran_id || invoice]);

    try {
      await logAction(1, "DONATION_RECEIVED", result.insertId, null, `Received ${amount} TK via Gateway Transaction ID: ${bank_tran_id || invoice}`);
    } catch (auditErr) {
      console.warn("Audit tracking skipped.");
    }

    // Direct routing return payload back into the user's front-end client tab
    res.send(`
      <script>
        alert("Thank you! Your donation registry processed cleanly through SSLCommerz.");
        window.location.href = "http://localhost:3000/donation-history";
      </script>
    `);
  } catch (err) {
    console.error("🔴 Payment Success Write Failure:", err);
    res.status(500).send("Database ingestion synchronization error.");
  }
});

// C. Step 3: Handle Fallback payment errors gracefully
app.post("/api/payment/fail", async (req, res) => {
  res.send(`
    <script>
      alert("Payment transaction dropped. The SSLCommerz process was rejected.");
      window.location.href = "http://localhost:3000/donate";
    </script>
  `);
});

app.post("/api/payment/cancel", async (req, res) => {
  res.send(`
    <script>
      alert("Donation aborted by client user.");
      window.location.href = "http://localhost:3000/donate";
    </script>
  `);
});


app.post("/api/donations/item-submit", async (req, res) => {
  const { user_id, item_category, item_details, quantity } = req.body;

  if (!user_id || !item_category || !item_details || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const sql =
      "INSERT INTO item_donations (user_id, item_category, item_details, quantity, status) VALUES (?, ?, ?, ?, 'pending')";
    await db.query(sql, [
      user_id,
      item_category,
      item_details,
      parseInt(quantity, 10),
    ]);

    res
      .status(201)
      .json({
        success: true,
        message:
          "Item donation registered! Our volunteers will collect it soon.",
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error saving item donation" });
  }
});

app.get("/api/donations/item-user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sql =
      "SELECT * FROM item_donations WHERE user_id = ? ORDER BY id DESC";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item logs" });
  }
});

app.get("/api/admin/active-volunteers", async (req, res) => {
  try {
    const sql = "SELECT id, full_name FROM users WHERE role = 'volunteer'";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
});

// --- 12. ADMIN ITEM-DONATION ASSIGN ROUTE ---
app.patch("/api/admin/item-donations/:id/assign", async (req, res) => {
  const { id } = req.params;
  const volunteer_id =
    req.body.volunteer_id || req.body.volunteerId || req.body.id;

  if (!volunteer_id) {
    return res
      .status(400)
      .json({ success: false, message: "Volunteer ID is required" });
  }

  try {
    const sql =
      "UPDATE item_donations SET status = 'assigned', volunteer_id = ? WHERE id = ?";
    await db.query(sql, [volunteer_id.toString().trim(), id]);

    res.json({ success: true, message: "Volunteer assigned successfully!" });
  } catch (err) {
    console.error("Assign Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Database error assigning volunteer" });
  }
});

app.get("/api/admin/item-donations", async (req, res) => {
  try {
    const sql = `
      SELECT 
        id_records.id, 
        COALESCE(u.full_name, 'Anonymous Donor') as donor_name, 
        id_records.item_category, 
        id_records.item_details, 
        id_records.quantity, 
        id_records.status 
      FROM item_donations id_records
      LEFT JOIN users u ON id_records.user_id = u.id 
      ORDER BY id_records.id DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin donor item pipeline:", err);
    res.status(500).json([]);
  }
});

app.patch("/api/admin/item-donations/:id/collect", async (req, res) => {
  const { id } = req.params;
  try {
    const [donation] = await db.query(
      "SELECT item_category, item_details, quantity FROM item_donations WHERE id = ?",
      [id],
    );
    if (donation.length === 0)
      return res.status(404).json({ message: "Donation record not found" });

    const { item_category, item_details, quantity } = donation[0];

    await db.query(
      "UPDATE item_donations SET status = 'collected' WHERE id = ?",
      [id],
    );

    const [existingInv] = await db.query(
      "SELECT id, quantity FROM inventory WHERE item_name = ?",
      [item_details],
    );

    if (existingInv.length > 0) {
      const newQty = existingInv[0].quantity + parseInt(quantity, 10);
      await db.query("UPDATE inventory SET quantity = ? WHERE id = ?", [
        newQty,
        existingInv[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO inventory (item_name, category, quantity) VALUES (?, ?, ?)",
        [item_details, item_category, quantity],
      );
    }

    res.json({
      success: true,
      message:
        "Item successfully integrated to main warehouse inventory structure!",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message:
          "Error syncing collection data to warehouse storage blueprints",
      });
  }
});

// --- 13. VOLUNTEER TASKS RETRIEVAL ROUTE ---
app.get("/api/volunteer/tasks/:volunteerId", async (req, res) => {
  const { volunteerId } = req.params;
  try {
    const sql = `
      SELECT 
        id_records.id, 
        COALESCE(u.full_name, 'Anonymous Donor') as donor_name, 
        id_records.item_category, 
        id_records.item_details, 
        id_records.quantity, 
        id_records.status 
      FROM item_donations id_records
      LEFT JOIN users u ON id_records.user_id = u.id 
      WHERE LOWER(TRIM(id_records.status)) = 'assigned' 
        AND (TRIM(id_records.volunteer_id) = ? OR id_records.volunteer_id = ?)
      ORDER BY id_records.id DESC`;

    const searchIdStr = volunteerId.toString().trim();
    const searchIdInt = parseInt(volunteerId, 10);

    const [rows] = await db.query(sql, [searchIdStr, searchIdInt]);

    console.log(
      `[ResQ System] Live tasks loaded for Volunteer ID (${volunteerId}):`,
      rows.length,
      "rows found.",
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching volunteer tasks:", err);
    res
      .status(500)
      .json({
        message: "Error loading operational pipeline tasks",
        error: err.message,
      });
  }
});

// --- 14. GET USER PROFILE INFORMATION ---
app.get("/api/user/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT id, full_name, email, role FROM users WHERE id = ?";
    const [rows] = await db.query(sql, [id]);

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(404).json({ success: false, message: "User profile record not found." });
    }
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ success: false, message: "Database registry connectivity failure." });
  }
});

// --- 15. UPDATE USER PASSWORD WITH SECURITY AUDIT ---
app.patch("/api/user/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "All security parameters are required." });
  }

  try {
    const [userRows] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);

    if (userRows.length === 0 || userRows[0].password !== oldPassword) {
      return res.status(401).json({ success: false, message: "Authentication failed. Incorrect current password." });
    }

    const updateSql = "UPDATE users SET password = ? WHERE id = ?";
    await db.query(updateSql, [newPassword, userId]);

    await logAction(userId, "PASSWORD_MODIFICATION", userId, "SECURITY_REVISED", "SUCCESS");

    res.json({ success: true, message: "Security parameters updated. Password changed successfully!" });
  } catch (err) {
    console.error("Password Route Error:", err);
    res.status(500).json({ success: false, message: "Database validation rejection error." });
  }
});

// --- 16. PHONE VERIFICATION & LOCAL OTP GENERATION ROUTE ---
app.post("/api/verify-phone", async (req, res) => {
  const { email, phone_number } = req.body;

  if (!email || !phone_number) {
    return res.status(400).json({ success: false, message: "Email and phone number are required." });
  }

  try {
    const sql = "SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) AND TRIM(phone_number) = TRIM(?)";
    const [userRows] = await db.query(sql, [email, phone_number]);
    
    if (userRows.length > 0) {
      const testOtp = Math.floor(100000 + Math.random() * 900000);
      
      return res.status(200).json({ 
        success: true, 
        message: "Identity confirmed. Code dispatched.",
        otp: testOtp
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Provided email or phone number does not match any registered account." 
      });
    }
  } catch (err) {
    console.error("🔴 Verification API Error:", err);
    res.status(500).json({ success: false, message: "Internal server registry error." });
  }
});

// --- 17. DIRECT PASSWORD OVERWRITE ROUTE ---
app.post("/api/direct-reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing required credentials." });
  }

  try {
    const sql = "UPDATE users SET password = ? WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))";
    const [result] = await db.query(sql, [newPassword, email]);

    if (result.affectedRows > 0) {
      try {
        const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (user.length > 0) {
          await logAction(user[0].id, "PASSWORD_RESET_VIA_OTP", user[0].id, "EXPIRED_PASS", "SUCCESS");
        }
      } catch (logErr) {
        console.warn("Audit log entry skipped for password overwrite");
      }

      res.status(200).json({ success: true, message: "Password updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: "Account reference failed at final stage." });
    }
  } catch (err) {
    console.error("🔴 Password Overwrite Error:", err);
    res.status(500).json({ success: false, message: "Database failure writing new parameters." });
  }
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`ResQ Database Server running on node port ${PORT}`),
);