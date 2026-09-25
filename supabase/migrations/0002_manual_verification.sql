-- ============================================================================
-- BritNkri — Migration 0002: التحقق اليدوي من الوكالة (بدل الآلي عبر واتساب)
-- الوكالة كتأكد الحجز بعد مكالمة هاتفية عادية مع الزبون
-- ============================================================================

-- زيد سبب/وقت التأكيد اليدوي، باش يبقى فيه دليل (Audit trail)
alter table public.bookings
  add column if not exists confirmed_by uuid references public.profiles(id),
  add column if not exists confirmed_at timestamptz;

-- ماخاصناش جدول phone_verifications دابا (كان لواتساب) — نخليه كيفما هو
-- للمستقبل، بلا ما نمسحو والو
