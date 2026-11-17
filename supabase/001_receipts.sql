-- SnapNote — étape 4 : traçabilité (table receipts, RLS, trigger, bucket privé).
-- À coller dans Supabase → SQL Editor → Run. Le script peut être rejoué sans erreur.
-- Référence : prd.md (US4 et §7).

-- =====================================================================
-- 1. Table receipts
-- =====================================================================
create table if not exists public.receipts (
  id           uuid primary key default gen_random_uuid(),
  -- Qui a scanné : rempli par la base (défaut + trigger), jamais par le navigateur.
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  user_email   text,
  merchant     text not null check (length(btrim(merchant)) > 0),
  receipt_date date not null,
  amount_ht    numeric(10,2) check (amount_ht  is null or amount_ht  >= 0),
  amount_vat   numeric(10,2) check (amount_vat is null or amount_vat >= 0),
  amount_ttc   numeric(10,2) not null check (amount_ttc > 0),
  category     text not null default 'Autre'
               check (category in ('Restaurant', 'Transport', 'Carburant', 'Fournitures', 'Hébergement', 'Autre')),
  image_path   text,                       -- chemin dans le bucket « receipts » : <user_id>/<fichier>
  source       text not null default 'manual' check (source in ('manual', 'ai')),
  status       text not null default 'draft' check (status in ('draft', 'sent')),
  created_at   timestamptz not null default now(),   -- quand : imposé par le trigger
  sent_at      timestamptz
);

create index if not exists receipts_user_created_idx on public.receipts (user_id, created_at desc);

-- =====================================================================
-- 2. Triggers : la base impose qui et quand
-- =====================================================================
-- À l'insertion : auteur, email, horodatage et statut viennent de la base, quoi que le navigateur envoie.
create or replace function public.receipts_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise pour enregistrer une note.' using errcode = '42501';
  end if;
  new.user_id    := auth.uid();
  new.user_email := auth.jwt() ->> 'email';
  new.created_at := now();
  new.status     := 'draft';
  new.sent_at    := null;
  return new;
end;
$$;

drop trigger if exists receipts_before_insert on public.receipts;
create trigger receipts_before_insert
  before insert on public.receipts
  for each row execute function public.receipts_before_insert();

-- À la modification par un employé : les champs de traçabilité et d'envoi sont figés.
-- (Le statut « sent » ne peut être posé que par n8n, avec la clé service_role : auth.uid() est alors nul.)
create or replace function public.receipts_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.user_id    := old.user_id;
    new.user_email := old.user_email;
    new.created_at := old.created_at;
    new.status     := old.status;
    new.sent_at    := old.sent_at;
  end if;
  return new;
end;
$$;

drop trigger if exists receipts_before_update on public.receipts;
create trigger receipts_before_update
  before update on public.receipts
  for each row execute function public.receipts_before_update();

-- =====================================================================
-- 3. RLS : chaque employé ne voit et ne touche que ses notes
-- =====================================================================
alter table public.receipts enable row level security;

revoke all on public.receipts from anon;
grant select, insert, update, delete on public.receipts to authenticated;

drop policy if exists "receipts_select_own" on public.receipts;
drop policy if exists "receipts_insert_own" on public.receipts;
drop policy if exists "receipts_update_own_draft" on public.receipts;
drop policy if exists "receipts_delete_own_draft" on public.receipts;

create policy "receipts_select_own" on public.receipts
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "receipts_insert_own" on public.receipts
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Une note « sent » est figée : modification et suppression seulement tant qu'elle est en brouillon.
create policy "receipts_update_own_draft" on public.receipts
  for update to authenticated
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()) and status = 'draft');

create policy "receipts_delete_own_draft" on public.receipts
  for delete to authenticated
  using (user_id = (select auth.uid()) and status = 'draft');

-- =====================================================================
-- 4. Storage : bucket privé « receipts », un dossier par employé
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "receipts_files_select_own" on storage.objects;
drop policy if exists "receipts_files_insert_own" on storage.objects;
drop policy if exists "receipts_files_delete_own" on storage.objects;

-- Un fichier est accessible seulement si son premier dossier est l'identifiant de l'employé connecté.
create policy "receipts_files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "receipts_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "receipts_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
