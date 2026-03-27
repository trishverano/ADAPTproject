-- Run in Supabase SQL Editor
create extension if not exists postgis;

create table if not exists public.municipalities (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  province text,
  center_lat double precision,
  center_lon double precision
);

create table if not exists public.gis_features (
  id bigserial primary key,
  municipality_slug text not null,
  layer_key text not null,
  name text,
  properties jsonb default '{}'::jsonb,
  geom geometry(Geometry, 4326) not null,
  created_at timestamptz default now()
);

create index if not exists gis_features_muni_layer_idx on public.gis_features (municipality_slug, layer_key);
create index if not exists gis_features_geom_idx on public.gis_features using gist (geom);

create table if not exists public.kobo_submissions (
  id bigserial primary key,
  municipality_slug text not null,
  barangay text,
  respondent_name text,
  interviewer_name text,
  survey_date date,
  latitude double precision,
  longitude double precision,
  geom geometry(Point, 4326),
  raw_payload jsonb not null,
  submission_uuid text unique,
  created_at timestamptz default now()
);

create index if not exists kobo_submissions_muni_idx on public.kobo_submissions (municipality_slug);
create index if not exists kobo_submissions_geom_idx on public.kobo_submissions using gist (geom);

create or replace function public.get_municipality_layer_geojson(
  p_municipality_slug text,
  p_layer_key text
) returns json language plpgsql stable as $$
declare
  fc json;
begin
  if p_layer_key = 'kobo_submissions' then
    select json_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(json_agg(
        json_build_object(
          'type', 'Feature',
          'geometry', st_asgeojson(geom)::json,
          'properties', json_build_object(
            'id', id,
            'name', coalesce(respondent_name, barangay, 'Submission'),
            'barangay', barangay,
            'survey_date', survey_date,
            'municipality_slug', municipality_slug
          )
        )
      ), '[]'::json)
    ) into fc
    from public.kobo_submissions
    where (p_municipality_slug = 'all' or municipality_slug = p_municipality_slug)
      and geom is not null;
  else
    select json_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(json_agg(
        json_build_object(
          'type', 'Feature',
          'geometry', st_asgeojson(geom)::json,
          'properties', json_build_object(
            'id', id,
            'name', coalesce(name, layer_key || ' feature'),
            'layer_key', layer_key,
            'municipality_slug', municipality_slug
          ) || coalesce(properties, '{}'::jsonb)
        )
      ), '[]'::json)
    ) into fc
    from public.gis_features
    where (p_municipality_slug = 'all' or municipality_slug = p_municipality_slug)
      and layer_key = p_layer_key;
  end if;

  return fc;
end;
$$;

alter table public.gis_features enable row level security;
alter table public.kobo_submissions enable row level security;

create policy "Public read gis_features" on public.gis_features
for select using (true);

create policy "Public read kobo_submissions" on public.kobo_submissions
for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.gis_features to anon, authenticated;
grant select on public.kobo_submissions to anon, authenticated;
grant execute on function public.get_municipality_layer_geojson(text, text) to anon, authenticated;
