window.APP_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  municipalitySlug: 'san-teodoro',
  municipalityName: 'San Teodoro, Oriental Mindoro',
  center: [121.09, 13.43],
  zoom: 12,
  extent4326: [120.98, 13.34, 121.20, 13.54],
  logos: { municipality: '../../shared/assets/img/logos/san-teodoro-logo.png', sponsor1: '../../shared/assets/img/logos/pfpi-logo.png', sponsor2: '../../shared/assets/img/logos/sponsor-2.png' },
  weather: { latitude: 13.43, longitude: 121.09, label: 'San Teodoro' },
  layers: [
    { key: 'barangays', label: 'Barangay Boundary', color: '#1d4ed8', visible: true },
    { key: 'built_up', label: 'Built-up / Settlements', color: '#ef4444', visible: true },
    { key: 'mangroves', label: 'Mangroves', color: '#16a34a', visible: true },
    { key: 'mpa_zones', label: 'MPA / Zoning', color: '#f59e0b', visible: true },
    { key: 'municipal_waters', label: 'Municipal Waters', color: '#0891b2', visible: true },
    { key: 'kobo_submissions', label: 'Kobo Field Submissions', color: '#0f766e', visible: true }
  ]
};
