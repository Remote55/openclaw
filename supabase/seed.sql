-- =============================================================================
-- OpenClaw Seed Data
-- =============================================================================
-- Run with: supabase db reset (local) or applied manually via migration in prod
-- =============================================================================

-- Demo cities
insert into public.cities (slug, name_en, name_th, country_code, latitude, longitude, timezone)
values
  ('tokyo',   'Tokyo',   'โตเกียว',   'JP', 35.6762,  139.6503, 'Asia/Tokyo'),
  ('bangkok', 'Bangkok', 'กรุงเทพฯ',  'TH', 13.7563,  100.5018, 'Asia/Bangkok'),
  ('paris',   'Paris',   'ปารีส',    'FR', 48.8566,    2.3522, 'Europe/Paris'),
  ('hat-yai', 'Hat Yai', 'หาดใหญ่',  'TH',  7.0086,  100.4747, 'Asia/Bangkok')
on conflict (slug) do nothing;