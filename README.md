# MSP OpenLayers + KoboToolbox + Supabase starter

This starter is for the setup you decided on:
- one site per municipality
- one shared database
- free hosting for the sites
- KoboToolbox field data synced to the same database
- weather widget for daily temperature and humidity

## Folder arrangement in VS Code

Open this whole folder in VS Code.

```text
msp-openlayers-template/
├─ README.md
├─ shared/
│  ├─ assets/
│  │  ├─ css/styles.css
│  │  ├─ js/app.js
│  │  ├─ js/weather.js
│  │  └─ img/logos/
│  │     ├─ pola-logo.png
│  │     ├─ sablayan-logo.png
│  │     ├─ puerto-galera-logo.png
│  │     ├─ looc-san-jose-logo.png
│  │     ├─ calapan-logo.png
│  │     ├─ san-teodoro-logo.png
│  │     ├─ pfpi-logo.png
│  │     ├─ sponsor-2.png
│  │     └─ path-logo.png
│  └─ data/
├─ sites/
│  ├─ pola/
│  │  ├─ index.html
│  │  └─ config.js
│  ├─ sablayan/
│  ├─ puerto-galera/
│  ├─ looc-san-jose/
│  ├─ calapan/
│  ├─ san-teodoro/
│  └─ path-admin/
└─ supabase/
   ├─ schema.sql
   ├─ sample-data.sql
   └─ functions/
      └─ kobo-sync/
         └─ index.ts
```

## Where to put the logos

Put all logos here:

`shared/assets/img/logos/`

Use these exact filenames so you do not need to edit the code:
- `pola-logo.png`
- `sablayan-logo.png`
- `puerto-galera-logo.png`
- `looc-san-jose-logo.png`
- `calapan-logo.png`
- `san-teodoro-logo.png`
- `pfpi-logo.png`
- `sponsor-2.png`
- `path-logo.png`

## What to edit first

### 1) Create the free database
Use Supabase free for the shared Postgres database.
- database size on the Free plan is 500 MB
- file storage is 1 GB
- API requests are unlimited on the pricing page

Run `supabase/schema.sql` first, then `supabase/sample-data.sql`.

### 2) Load your GIS data
Your map reads from the `gis_features` table.
For each layer, load the geometry and set:
- `municipality_slug`
- `layer_key`
- `name`
- `properties`
- `geom`

Recommended `layer_key` values:
- `barangays`
- `built_up`
- `mangroves`
- `wma_zones`
- `mpa_zones`
- `municipal_waters`
- `pwd_points`

### 3) Get your Supabase keys
In each `sites/.../config.js`, replace:
- `https://YOUR-PROJECT.supabase.co`
- `YOUR_SUPABASE_ANON_KEY`

### 4) Connect KoboToolbox
In KoboToolbox, use **REST Services** to send every new submission to your deployed Supabase Edge Function.
Suggested endpoint:

`https://YOUR-PROJECT.functions.supabase.co/kobo-sync`

Set a custom header:
- name: `webhook-auth`
- value: your secret

The Edge Function checks that header and then writes the submission into `kobo_submissions`.

### 5) Match Kobo question names
For easiest syncing, use these Kobo field names in your form:
- `municipality_slug`
- `barangay`
- `respondent_name`
- `interviewer_name`
- `survey_date`
- `latitude`
- `longitude`

If your real Kobo names are different, just edit `supabase/functions/kobo-sync/index.ts`.

### 6) Publish the sites for free
Use Cloudflare Pages free.
You can either:
- publish the whole project and use `/sites/pola/`, `/sites/sablayan/`, etc.
- or create one Pages project per municipality folder

## Which files you edit when

### Before uploading to hosting
Edit these files first:
- `sites/*/config.js`
- `shared/assets/img/logos/*`
- `supabase/functions/kobo-sync/index.ts` if Kobo field names differ

### After database is ready
Load your real GIS layers into `gis_features`.

### After Kobo form is ready
Turn on Kobo REST Services and point it to the Edge Function.

## Notes
- The weather widget uses Open-Meteo and needs only coordinates.
- The basemap is OpenStreetMap through OpenLayers.
- Export is done as JPEG from the browser.
- The `path-admin` site is optional. It gives PFPI one overview site while still keeping one site per municipality.
