-- ============================================================================
-- BritNkri — Migration 0001: الأساسيات (MVP)
-- زبون، وكالة، سيارات، حجوزات، تحقق الهاتف عبر واتساب
-- ============================================================================

-- تمديد UUID (لازم لتوليد المعرفات)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: كل مستخدم مسجل (زبون أو صاحب وكالة)، مربوط بـ auth.users ديال Supabase
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  role text not null default 'customer' check (role in ('customer', 'agency_owner', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- كل واحد يقدر يشوف ويبدل غير البروفايل ديالو
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- agencies: الوكالات
-- ----------------------------------------------------------------------------
create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  city text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

alter table public.agencies enable row level security;

-- الكل يقدر يشوف الوكالات (باش الزبون يقدر يبحث)
create policy "agencies: public read"
  on public.agencies for select
  using (true);

-- غير صاحب الوكالة يقدر يبدلها
create policy "agencies: owner update"
  on public.agencies for update
  using (auth.uid() = owner_id);

create policy "agencies: owner insert"
  on public.agencies for insert
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- cars: السيارات ديال كل وكالة
-- ----------------------------------------------------------------------------
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  plate text not null,
  price_per_day numeric not null,
  city text not null,
  fuel_type text,
  transmission text,
  seats int default 5,
  km numeric default 0,
  is_maintenance boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.cars enable row level security;

-- الكل يقدر يشوف السيارات (البحث العمومي)
create policy "cars: public read"
  on public.cars for select
  using (true);

-- غير صاحب الوكالة يقدر يبدل/يزيد سيارات ديالو
create policy "cars: agency owner manage"
  on public.cars for all
  using (agency_id in (select id from public.agencies where owner_id = auth.uid()))
  with check (agency_id in (select id from public.agencies where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- bookings: الحجوزات — القلب ديال النظام
-- ----------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete restrict,
  agency_id uuid not null references public.agencies(id) on delete restrict,
  customer_id uuid references public.profiles(id) on delete set null, -- null = زبون ضيف
  customer_phone text not null, -- دايما مسجل، حتى للضيوف
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'card')),
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'picked_up', 'returned', 'cancelled')
  ),
  phone_verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- الزبون يشوف غير الحجوزات ديالو
create policy "bookings: customer read own"
  on public.bookings for select
  using (auth.uid() = customer_id);

-- صاحب الوكالة يشوف غير حجوزات الوكالة ديالو (هادي القاعدة الأهم أمنيا)
create policy "bookings: agency read own"
  on public.bookings for select
  using (agency_id in (select id from public.agencies where owner_id = auth.uid()));

-- الزبون (مسجل) يقدر يخلق حجز ليه
create policy "bookings: customer insert"
  on public.bookings for insert
  with check (auth.uid() = customer_id or customer_id is null);

-- صاحب الوكالة يقدر يبدل حالة الحجوزات ديالو (مثلا: confirmed -> picked_up)
create policy "bookings: agency update own"
  on public.bookings for update
  using (agency_id in (select id from public.agencies where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- phone_verifications: نفس منطق whatsappVerify.js اللي بنينا، بلا ما تضيع
-- الحالة عند إعادة تشغيل السيرفر (كانت Map مؤقتة، دابا جدول حقيقي)
-- ----------------------------------------------------------------------------
create table public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.phone_verifications enable row level security;

-- الوصول ليها غير عبر service_role (السيرفر ديالنا)، ماشي مباشرة من الواجهة الأمامية
create policy "phone_verifications: server only"
  on public.phone_verifications for all
  using (false);
