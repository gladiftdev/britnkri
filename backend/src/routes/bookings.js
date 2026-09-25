// API الحجوزات — التحقق دابا يدوي من الوكالة، بلا SMS ولا واتساب آلي.

const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// POST /api/bookings — الزبون كيخلق حجز، بحالة "pending" (فانتظار تأكيد الوكالة)
router.post("/bookings", async (req, res) => {
  try {
    const { car_id, agency_id, customer_phone, start_date, end_date, total_price, payment_method } = req.body;
    if (!car_id || !agency_id || !customer_phone || !start_date || !end_date) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        car_id, agency_id, customer_phone, start_date, end_date,
        total_price, payment_method: payment_method || "cash",
        status: "pending", phone_verified: false,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ booking: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// PATCH /api/bookings/:id/confirm — صاحب الوكالة كيأكد الحجز يدويا (بعد مكالمة)
router.patch("/bookings/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed_by } = req.body; // profile id ديال صاحب الوكالة

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        phone_verified: true, // تأكيد يدوي = بمثابة تحقق
        confirmed_by,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ booking: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET /api/bookings/pending?agency_id=xxx — الحجوزات اللي فانتظار تأكيد الوكالة
router.get("/bookings/pending", async (req, res) => {
  try {
    const { agency_id } = req.query;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("agency_id", agency_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ bookings: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
