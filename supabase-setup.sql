-- Execute este arquivo no Supabase: SQL Editor > New query > Run.
create table if not exists public.monitoria_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.monitoria_invites (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.monitoria_collections (
  collection text primary key,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_monitoria_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.monitoria_profiles where id = auth.uid()), false);
$$;

create or replace function public.create_monitoria_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email <> 'pedromceara@hotmail.com' and not exists (select 1 from public.monitoria_invites where email = lower(new.email)) then
    raise exception 'Este e-mail não possui convite para o Monitoria.';
  end if;
  insert into public.monitoria_profiles (id, email, is_admin)
  values (new.id, lower(new.email), lower(new.email) = 'pedromceara@hotmail.com');
  delete from public.monitoria_invites where email = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_monitoria_auth_user_created on auth.users;
create trigger on_monitoria_auth_user_created after insert on auth.users
for each row execute procedure public.create_monitoria_profile();

alter table public.monitoria_profiles enable row level security;
alter table public.monitoria_invites enable row level security;
alter table public.monitoria_collections enable row level security;

create policy "authenticated users read profiles" on public.monitoria_profiles for select to authenticated using (true);
create policy "admins manage invitations" on public.monitoria_invites for all to authenticated using (public.is_monitoria_admin()) with check (public.is_monitoria_admin());
create policy "authenticated users read shared monitoria" on public.monitoria_collections for select to authenticated using (true);
create policy "authenticated users create shared monitoria" on public.monitoria_collections for insert to authenticated with check (true);
create policy "authenticated users update shared monitoria" on public.monitoria_collections for update to authenticated using (true) with check (true);

-- Crie primeiro o usuário pedromceara@hotmail.com em Authentication > Users > Add user.
-- Em seguida, este comando promove esse usuário a administrador caso ele já exista.
insert into public.monitoria_profiles (id, email, is_admin)
select id, lower(email), true from auth.users where lower(email) = 'pedromceara@hotmail.com'
on conflict (id) do update set is_admin = true;
