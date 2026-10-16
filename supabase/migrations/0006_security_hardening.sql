-- =========================================================
-- PPID DIGITAL - DINAS CIKASDA PROV. SULTENG
-- Migration 0006: Security Hardening (Anti Privilege Escalation)
-- =========================================================

-- 1. Mencegah manipulasi role akun oleh pengguna biasa (Privilege Escalation Protection)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Jika kolom role mengalami perubahan
    if new.role is distinct from old.role then
        -- Hanya izinkan jika pemanggil memiliki hak akses admin aktif
        if not public.is_admin() then
            raise exception 'Akses ditolak: Hanya administrator yang berhak mengubah peran akun.';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- 2. Memperketat handle_new_user agar selalu menetapkan role 'pemohon' (mencegah manipulasi metadata auth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        nama,
        nik,
        email,
        telepon,
        role
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'nama',
            new.raw_user_meta_data ->> 'name',
            ''
        ),
        new.raw_user_meta_data ->> 'nik',
        new.email,
        coalesce(
            new.raw_user_meta_data ->> 'telepon',
            new.raw_user_meta_data ->> 'no_hp',
            ''
        ),
        'pemohon' -- Hardcoded: pendaftar baru selalu memiliki role pemohon
    )
    on conflict (id) do nothing;

    return new;
end;
$$;
