insert into public.municipalities (slug, name, province, center_lat, center_lon)
values
('pola', 'Pola', 'Oriental Mindoro', 13.1439, 121.4417),
('sablayan', 'Sablayan', 'Occidental Mindoro', 12.8670, 120.7650),
('puerto-galera', 'Puerto Galera', 'Oriental Mindoro', 13.5020, 120.9550),
('looc-san-jose', 'Looc / San Jose', 'Occidental Mindoro', 12.2700, 121.0200),
('calapan', 'Calapan City', 'Oriental Mindoro', 13.4100, 121.1800),
('san-teodoro', 'San Teodoro', 'Oriental Mindoro', 13.4300, 121.0900)
on conflict (slug) do nothing;

-- Example feature inserts. Replace the WKT with your real geometries.
insert into public.gis_features (municipality_slug, layer_key, name, geom)
values
('pola', 'barangays', 'Batuhan', st_geomfromtext('POLYGON((121.40 13.10,121.48 13.10,121.48 13.18,121.40 13.18,121.40 13.10))',4326)),
('pola', 'mangroves', 'Batuhan Mangrove Area', st_geomfromtext('POLYGON((121.42 13.11,121.46 13.11,121.46 13.15,121.42 13.15,121.42 13.11))',4326)),
('pola', 'built_up', 'Coastal settlement', st_geomfromtext('POINT(121.445 13.135)',4326));
