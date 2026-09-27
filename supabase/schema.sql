-- Bitacora, Week 7 Business Bending schema
-- Paste this whole file into Supabase Dashboard > SQL Editor > New query > Run.

-- ============================================================
-- ASSOCIATIONS. One row per route-association admin account. Scope cut:
-- one association per admin this week, not a multi-tenant marketplace.
-- ============================================================
create table if not exists associations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table associations enable row level security;

create policy "associations: owner selects own"
  on associations for select
  using (auth.uid() = owner_id);

create policy "associations: owner inserts own"
  on associations for insert
  with check (auth.uid() = owner_id);

create policy "associations: owner updates own"
  on associations for update
  using (auth.uid() = owner_id);

-- ============================================================
-- UNITS. The 12-vehicle example from the packet. Belongs to one association.
-- ============================================================
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  association_id uuid not null references associations(id) on delete cascade,
  label text not null,
  expected_interval_minutes integer not null default 5,
  created_at timestamptz not null default now()
);

alter table units enable row level security;

create policy "units: owner selects own"
  on units for select
  using (
    exists (select 1 from associations a where a.id = units.association_id and a.owner_id = auth.uid())
  );

create policy "units: owner inserts own"
  on units for insert
  with check (
    exists (select 1 from associations a where a.id = units.association_id and a.owner_id = auth.uid())
  );

-- ============================================================
-- TELEMETRY PINGS. Simulated GPS pings only, per the packet's scope cut,
-- never real hardware this week. No driver identity field exists anywhere
-- in this schema, by design, matching the shadow clause.
-- ============================================================
create table if not exists telemetry_pings (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  pinged_at timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null
);

alter table telemetry_pings enable row level security;

create policy "telemetry_pings: owner selects own"
  on telemetry_pings for select
  using (
    exists (
      select 1 from units u
      join associations a on a.id = u.association_id
      where u.id = telemetry_pings.unit_id and a.owner_id = auth.uid()
    )
  );

create policy "telemetry_pings: owner inserts own"
  on telemetry_pings for insert
  with check (
    exists (
      select 1 from units u
      join associations a on a.id = u.association_id
      where u.id = telemetry_pings.unit_id and a.owner_id = auth.uid()
    )
  );

-- ============================================================
-- SHARE CONSENTS. The load-bearing table for the Blueprint's shadow clause:
-- nothing here exists until the association's own admin explicitly consents.
-- Once consented=true, the snapshot (aggregate only, no driver identity,
-- built server-side from the association's own units) becomes visible to
-- any authenticated user, simulating the government/insurer viewer. This is
-- revocable: setting consented back to false hides it again immediately.
-- ============================================================
create table if not exists share_consents (
  id uuid primary key default gen_random_uuid(),
  association_id uuid not null references associations(id) on delete cascade,
  consented boolean not null default false,
  consented_at timestamptz,
  snapshot jsonb,
  updated_at timestamptz not null default now()
);

alter table share_consents enable row level security;

create policy "share_consents: owner selects own"
  on share_consents for select
  using (
    exists (select 1 from associations a where a.id = share_consents.association_id and a.owner_id = auth.uid())
  );

create policy "share_consents: owner inserts own"
  on share_consents for insert
  with check (
    exists (select 1 from associations a where a.id = share_consents.association_id and a.owner_id = auth.uid())
  );

create policy "share_consents: owner updates own"
  on share_consents for update
  using (
    exists (select 1 from associations a where a.id = share_consents.association_id and a.owner_id = auth.uid())
  );

-- Simulated government/insurer viewer: any signed-in user may see a
-- consented row, but only the row itself (aggregate snapshot + association
-- name), never the underlying units or telemetry_pings tables, and never
-- before consented is true. This is the entire enforcement of "nothing
-- reaches Gov before Admin has already seen and approved it."
create policy "share_consents: any authenticated user sees consented rows"
  on share_consents for select
  using (consented = true);

-- ============================================================
-- TABLE-LEVEL GRANTS. RLS restricts rows, PostgREST also needs the base
-- grant, learned the hard way in sibling projects this course: "Automatically
-- expose new tables" off at project creation blocks every request with a
-- 403, reads included, even with RLS configured correctly.
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.associations to authenticated;
grant select, insert on public.units to authenticated;
grant select, insert on public.telemetry_pings to authenticated;
grant select, insert, update on public.share_consents to authenticated;
