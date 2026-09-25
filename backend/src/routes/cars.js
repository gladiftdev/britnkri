// API السيارات — البحث والتفاصيل، للواجهة الأمامية

const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabaseClient");

// GET /api/cars?city=بني ملال — البحث عن سيارات متوفرة
router.get("/cars", async (req, res) => {
  try {
    const { city } = req.query;
    let query = supabase.from("cars").select("*, agencies(name, phone)").eq("is_maintenance", false);
    if (city) query = query.eq("city", city);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ cars: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET /api/cars/:id — تفاصيل سيارة وحدة
router.get("/cars/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*, agencies(name, phone, city, address)")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json({ car: data });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "not_found" });
  }
});

module.exports = router;
