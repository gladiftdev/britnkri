// جسر الاتصال مع الـBackend الحقيقي (Vercel + Supabase)
// كل دالة هنا كتبدل جزء كان قبل "محاكاة" (setTimeout, بيانات ثابتة) بطلب حقيقي.

const API_BASE = "https://britnkri-api.vercel.app";

// البحث عن السيارات المتوفرة (تبدل INITIAL_CARS الثابتة)
export async function fetchCars(city) {
  const url = city
    ? `${API_BASE}/api/cars?city=${encodeURIComponent(city)}`
    : `${API_BASE}/api/cars`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("فشل جلب السيارات");
  const data = await res.json();
  return data.cars;
}

// تفاصيل سيارة وحدة
export async function fetchCarDetails(carId) {
  const res = await fetch(`${API_BASE}/api/cars/${carId}`);
  if (!res.ok) throw new Error("السيارة غير موجودة");
  const data = await res.json();
  return data.car;
}

// خلق حجز حقيقي (تبدل setPaymentInfo المحلي)
export async function createBooking(booking) {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error("فشل إنشاء الحجز");
  const data = await res.json();
  return data.booking;
}

// الحجوزات المعلقة (للوكالة)
export async function fetchPendingBookings(agencyId) {
  const res = await fetch(`${API_BASE}/api/bookings/pending?agency_id=${agencyId}`);
  if (!res.ok) throw new Error("فشل جلب الحجوزات");
  const data = await res.json();
  return data.bookings;
}

// تأكيد حجز (زر الوكالة بعد المكالمة)
export async function confirmBooking(bookingId, confirmedBy) {
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/confirm`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmed_by: confirmedBy || null }),
  });
  if (!res.ok) throw new Error("فشل تأكيد الحجز");
  const data = await res.json();
  return data.booking;
}
