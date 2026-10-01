-- =========================================================
-- PPID DIGITAL - DINAS CIKASDA PROV. SULTENG
-- Migration 0005: Helper Auth & NIK Lookup Function
-- =========================================================

-- 1. Function untuk mencari email berdasarkan NIK secara aman bagi proses login form
create or replace function public.get_email_by_nik(p_nik text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_email text;
begin
    select email into v_email
    from public.profiles
    where nik = p_nik
    limit 1;
    
    return v_email;
end;
$$;

-- Berikan izin akses eksekusi fungsi ke role anon dan authenticated
grant execute on function public.get_email_by_nik(text) to anon, authenticated;

-- 2. Function untuk memeriksa apakah NIK sudah digunakan oleh akun lain (tanpa terhalang RLS)
create or replace function public.is_nik_registered(p_nik text, p_exclude_user_id uuid default null)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where nik = p_nik
      and (p_exclude_user_id is null or id != p_exclude_user_id)
  );
$$;

-- Berikan izin akses eksekusi ke role authenticated dan anon
grant execute on function public.is_nik_registered(text, uuid) to anon, authenticated;

