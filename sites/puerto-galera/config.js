window.APP_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  municipalitySlug: 'puerto-galera',
  municipalityName: 'Puerto Galera, Oriental Mindoro',
  center: [120.955, 13.502],
  zoom: 13,
  extent4326: [120.88, 13.44, 121.04, 13.57],
  logos: { municipality: '../../shared/assets/img/logos/puerto-galera-logo.png', sponsor1: '../../shared/assets/img/logos/pfpi-logo.png', sponsor2: '../../shared/assets/img/logos/sponsor-2.png' },
  weather: { latitude: 13.502, longitude: 120.955, label: 'Puerto Galera' },
  layers: [
    { key: 'barangays', label: 'Barangay Boundary', color: '#1d4ed8', visible: true },
    { key: 'built_up', label: 'Built-up / Settlements', color: '#ef4444', visible: true },
    { key: 'mangroves', label: 'Mangroves', color: '#16a34a', visible: true },
    { key: 'wma_zones', label: 'WMA / Zoning', color: '#f59e0b', visible: true },
    { key: 'pwd_points', label: 'PWD / Inclusion Points', color: '#7c3aed', visible: false },
    { key: 'kobo_submissions', label: 'Kobo Field Submissions', color: '#0f766e', visible: true }
  ]
};
