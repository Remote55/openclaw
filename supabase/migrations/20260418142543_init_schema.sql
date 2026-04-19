-- =============================================================================
-- OpenClaw Initial Schema
-- =============================================================================
-- Creates core tables: profiles, cities, hotels, events, bookings, chat
-- Enables pgvector for semantic search
-- Sets up Row Level Security (RLS) policies
-- =============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- pgvector for semantic search (embeddings)
create extension if not exists vector with schema extensions;

-- UUID generation (should already be enabled)
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.booking_status as enum (
  'draft',        -- user is still filling out
  'pending',      -- sent to LiteAPI, awaiting confirmation
  'confirmed',    -- LiteAPI confirmed booking
  'cancelled',    -- user or system cancelled
  'failed'        -- booking failed (payment, provider error)
);

create type public.event_category as enum (
  'festival',
  'concert',
  'exhibition',
  'sports',
  'conference',
  'food',
  'other'
);

create type public.supported_locale as enum ('th', 'en');

-- ============================================================================
-- TABLE: cities
-- ============================================================================
-- 4 demo cities. Seeded separately in seed.sql
-- ============================================================================

create table public.cities (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,  -- 'tokyo', 'bangkok', 'paris', 'hat-yai'
  name_en      text not null,
  name_th      text not null,
  country_code char(2) not null,      -- 'JP', 'TH', 'FR'
  latitude     double precision not null,
  longitude    double precision not null,
  timezone     text not null,         -- 'Asia/Tokyo'
  created_at   timestamptz not null default now()
);

create index cities_slug_idx on public.cities (slug);
create index cities_country_idx on public.cities (country_code);

-- ============================================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================================
-- Matches auth.users 1:1 via id. Supabase best-practice pattern.
-- ============================================================================

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  preferred_locale public.supported_locale not null default 'th',
  phone_e164      text,                 -- +66812345678
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TABLE: hotels (cache from LiteAPI)
-- ============================================================================
-- We cache hotel content (name, description, images) for speed.
-- LIVE availability/rates come from LiteAPI in real-time, never cached here.
-- ============================================================================

create table public.hotels (
  id                  uuid primary key default gen_random_uuid(),
  liteapi_hotel_id    text not null unique,  -- LiteAPI's hotel ID
  city_id             uuid not null references public.cities(id) on delete cascade,
  name                text not null,
  description         text,
  description_th      text,  -- Thai translation (generated or manual)
  address             text,
  latitude            double precision,
  longitude           double precision,
  star_rating         smallint check (star_rating between 1 and 5),
  thumbnail_url       text,
  image_urls          text[] default '{}',
  amenities           text[] default '{}',  -- ['wifi', 'pool', 'gym']

  -- Vector embedding for semantic search
  -- Using 1536 dimensions (OpenAI text-embedding-3-small / Gemini compatible)
  embedding           extensions.vector(1536),

  raw_data            jsonb,  -- Full LiteAPI response for debugging
  last_synced_at      timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index hotels_city_idx on public.hotels (city_id);
create index hotels_liteapi_idx on public.hotels (liteapi_hotel_id);
create index hotels_star_idx on public.hotels (star_rating);

-- HNSW index for fast vector similarity search
-- m=16, ef_construction=64 are Supabase-recommended defaults for most cases
create index hotels_embedding_idx on public.hotels
  using hnsw (embedding extensions.vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================================
-- TABLE: events
-- ============================================================================
-- Festivals, concerts, exhibitions from Ticketmaster + SerpAPI + manual
-- ============================================================================

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  source          text not null,          -- 'ticketmaster', 'serpapi', 'manual'
  source_id       text,                   -- ID from the source API
  city_id         uuid not null references public.cities(id) on delete cascade,
  category        public.event_category not null default 'other',

  name            text not null,
  name_th         text,
  description     text,
  description_th  text,

  venue_name      text,
  venue_address   text,
  latitude        double precision,
  longitude       double precision,

  starts_at       timestamptz not null,
  ends_at         timestamptz,
  timezone        text not null default 'UTC',

  url             text,
  image_url       text,
  price_min       numeric(10, 2),
  price_max       numeric(10, 2),
  currency        char(3),                -- 'USD', 'THB', 'EUR', 'JPY'

  embedding       extensions.vector(1536),

  raw_data        jsonb,
  last_synced_at  timestamptz not null default now(),
  created_at      timestamptz not null default now(),

  unique (source, source_id)
);

create index events_city_idx on public.events (city_id);
create index events_starts_at_idx on public.events (starts_at);
create index events_category_idx on public.events (category);
create index events_embedding_idx on public.events
  using hnsw (embedding extensions.vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================================
-- TABLE: bookings
-- ============================================================================

create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete restrict,
  hotel_id              uuid not null references public.hotels(id) on delete restrict,

  -- LiteAPI booking tracking
  liteapi_prebook_id    text,
  liteapi_booking_id    text unique,
  liteapi_confirmation  text,

  -- Booking details (snapshotted at booking time, not references)
  check_in              date not null,
  check_out             date not null,
  guest_count           smallint not null check (guest_count > 0),
  rooms_count           smallint not null default 1 check (rooms_count > 0),

  -- Guest info (name at booking, not necessarily the user)
  guest_first_name      text not null,
  guest_last_name       text not null,
  guest_email           text not null,
  guest_phone_e164      text,

  -- Pricing
  total_amount          numeric(12, 2) not null check (total_amount >= 0),
  currency              char(3) not null,

  -- Payment
  stripe_payment_intent text unique,

  -- Status
  status                public.booking_status not null default 'draft',
  error_message         text,    -- If failed, why

  -- Idempotency for retries
  idempotency_key       text unique,

  -- Audit
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  confirmed_at          timestamptz,
  cancelled_at          timestamptz,

  constraint valid_date_range check (check_out > check_in)
);

create index bookings_user_idx on public.bookings (user_id);
create index bookings_hotel_idx on public.bookings (hotel_id);
create index bookings_status_idx on public.bookings (status);
create index bookings_dates_idx on public.bookings (check_in, check_out);

-- ============================================================================
-- TABLE: chat_sessions
-- ============================================================================
-- One session = one conversation with the AI agent
-- ============================================================================

create table public.chat_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,  -- NULL = anonymous
  title           text,
  locale          public.supported_locale not null default 'th',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index chat_sessions_user_idx on public.chat_sessions (user_id);

-- ============================================================================
-- TABLE: chat_messages
-- ============================================================================

create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.chat_sessions(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'tool')),
  content         text not null,
  tool_name       text,       -- if role = 'tool'
  tool_call_id    text,       -- if role = 'tool'
  metadata        jsonb,      -- model, tokens, latency, etc.
  created_at      timestamptz not null default now()
);

create index chat_messages_session_idx on public.chat_messages (session_id, created_at);

-- ============================================================================
-- AUTO-UPDATE updated_at triggers
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger hotels_updated_at before update on public.hotels
  for each row execute function public.set_updated_at();

create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create trigger chat_sessions_updated_at before update on public.chat_sessions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on ALL public tables. This is critical for security.
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.cities         enable row level security;
alter table public.hotels         enable row level security;
alter table public.events         enable row level security;
alter table public.bookings       enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;

-- ============================================================================
-- RLS POLICIES: profiles
-- ============================================================================

create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ============================================================================
-- RLS POLICIES: cities (public read)
-- ============================================================================

create policy "Cities are viewable by everyone"
  on public.cities for select
  using (true);

-- ============================================================================
-- RLS POLICIES: hotels (public read)
-- ============================================================================

create policy "Hotels are viewable by everyone"
  on public.hotels for select
  using (true);

-- ============================================================================
-- RLS POLICIES: events (public read)
-- ============================================================================

create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

-- ============================================================================
-- RLS POLICIES: bookings (user can only see their own)
-- ============================================================================

create policy "Users can view own bookings"
  on public.bookings for select
  using ((select auth.uid()) = user_id);

create policy "Users can create own bookings"
  on public.bookings for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS POLICIES: chat_sessions
-- ============================================================================

create policy "Users can view own chat sessions"
  on public.chat_sessions for select
  using ((select auth.uid()) = user_id or user_id is null);

create policy "Anyone can create chat sessions"
  on public.chat_sessions for insert
  with check (true);  -- Allow anonymous sessions; we enforce user_id elsewhere

create policy "Users can update own chat sessions"
  on public.chat_sessions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================================
-- RLS POLICIES: chat_messages
-- ============================================================================

create policy "Users can view messages in own sessions"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and ((select auth.uid()) = s.user_id or s.user_id is null)
    )
  );

create policy "Users can insert messages in own sessions"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and ((select auth.uid()) = s.user_id or s.user_id is null)
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Match hotels by semantic similarity (for AI search)
create or replace function public.match_hotels (
  query_embedding extensions.vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_city_id uuid default null
)
returns table (
  id uuid,
  liteapi_hotel_id text,
  name text,
  description text,
  similarity float
)
language sql
stable
set search_path = public, extensions  -- เพิ่มบรรทัดนี้เข้ามาครับ
as $$
  select
    h.id,
    h.liteapi_hotel_id,
    h.name,
    h.description,
    1 - (h.embedding <=> query_embedding) as similarity
  from public.hotels h
  where h.embedding is not null
    and (filter_city_id is null or h.city_id = filter_city_id)
    and 1 - (h.embedding <=> query_embedding) > match_threshold
  order by h.embedding <=> query_embedding
  limit match_count;
$$;

-- Match events by semantic similarity
create or replace function public.match_events (
  query_embedding extensions.vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_city_id uuid default null,
  filter_start_date date default null,
  filter_end_date date default null
)
returns table (
  id uuid,
  name text,
  description text,
  starts_at timestamptz,
  similarity float
)
language sql
stable
set search_path = public, extensions
as $$
  select
    e.id,
    e.name,
    e.description,
    e.starts_at,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.events e
  where e.embedding is not null
    and (filter_city_id is null or e.city_id = filter_city_id)
    and (filter_start_date is null or e.starts_at::date >= filter_start_date)
    and (filter_end_date is null or e.starts_at::date <= filter_end_date)
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- COMMENTS (documentation visible in Studio)
-- ============================================================================

comment on table public.profiles is 'Extends auth.users with app-specific profile data';
comment on table public.cities is 'Demo cities: Tokyo, Bangkok, Paris, Hat Yai';
comment on table public.hotels is 'Cached hotel content from LiteAPI. Availability is fetched live, never cached.';
comment on table public.events is 'Events from Ticketmaster, SerpAPI, and manual entries';
comment on table public.bookings is 'User bookings tracked through LiteAPI and Stripe';
comment on table public.chat_sessions is 'AI agent conversation sessions';
comment on table public.chat_messages is 'Messages within a chat session';