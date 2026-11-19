-- =========================================================
-- PPID DIGITAL - DINAS CIKASDA PROV. SULTENG
-- Migration 0007: Security Hardening v2 (RLS & Triggers)
-- =========================================================

-- 1. Ketatkan kebijakan INSERT tabel permohonan agar pemohon hanya dapat mengajukan dengan status awal sah
drop policy if exists "user insert permohonan sendiri" on public.permohonan;
create policy "user insert permohonan sendiri"
on public.permohonan
for insert
with check (
    auth.uid() = user_id
    and status = 'diajukan'
    and jawaban_admin is null
    and diperpanjang = false
    and alasan_perpanjangan is null
    and deadline_akhir is null
);

-- 2. Ketatkan kebijakan INSERT tabel profiles agar pengguna tidak dapat mengisi role selain pemohon
drop policy if exists "user insert profil sendiri" on public.profiles;
create policy "user insert profil sendiri"
on public.profiles
for insert
with check (
    auth.uid() = id
    and role = 'pemohon'
);

-- 3. Perluas trigger proteksi profil pada INSERT dan UPDATE (mengunci role dan mencegah pembajakan email oleh non-admin)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        if auth.uid() is not null and new.role is distinct from 'pemohon' and not public.is_admin() then
            raise exception 'Akses ditolak: Hanya administrator yang berhak menetapkan peran akun.';
        end if;
    elsif tg_op = 'UPDATE' then
        if auth.uid() is not null and not public.is_admin() then
            if new.role is distinct from old.role then
                raise exception 'Akses ditolak: Hanya administrator yang berhak mengubah peran akun.';
            end if;
            if new.email is distinct from old.email then
                raise exception 'Akses ditolak: Alamat email akun tidak dapat diubah langsung.';
            end if;
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
before insert or update on public.profiles
for each row
execute function public.protect_profile_role();

-- 4. Batasi eksekusi is_nik_registered hanya untuk pengguna terotentikasi
revoke execute on function public.is_nik_registered(text, uuid) from anon;
grant execute on function public.is_nik_registered(text, uuid) to authenticated;

-- 5. Tambahkan explicit WITH CHECK pada kebijakan admin daftar_informasi_tabel & daftar_informasi_item
drop policy if exists "admin kelola daftar informasi tabel" on public.daftar_informasi_tabel;
create policy "admin kelola daftar informasi tabel"
on public.daftar_informasi_tabel
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin kelola daftar informasi item" on public.daftar_informasi_item;
create policy "admin kelola daftar informasi item"
on public.daftar_informasi_item
for all
using (public.is_admin())
with check (public.is_admin());
