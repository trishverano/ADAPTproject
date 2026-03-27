// Supabase Edge Function
// Deploy with: supabase functions deploy kobo-sync
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const webhookAuth = req.headers.get('webhook-auth');
    if (webhookAuth !== Deno.env.get('KOBO_WEBHOOK_SECRET')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const payload = body?.data ?? body;

    const latitude = Number(payload.latitude || payload._latitude || payload.gps_lat);
    const longitude = Number(payload.longitude || payload._longitude || payload.gps_lon);
    const municipalitySlug = String(payload.municipality_slug || '').trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const row = {
      municipality_slug: municipalitySlug,
      barangay: payload.barangay || null,
      respondent_name: payload.respondent_name || null,
      interviewer_name: payload.interviewer_name || null,
      survey_date: payload.date_of_interview || payload.survey_date || null,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      geom: Number.isFinite(latitude) && Number.isFinite(longitude)
        ? `POINT(${longitude} ${latitude})`
        : null,
      raw_payload: payload,
      submission_uuid: payload._uuid || payload.instanceID || payload.submission_uuid || null
    };

    const { error } = await supabase
      .from('kobo_submissions')
      .upsert(row, { onConflict: 'submission_uuid' });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
