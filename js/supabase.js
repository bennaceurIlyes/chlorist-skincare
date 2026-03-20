/**
 * Chlorice Skincare — Supabase Client
 * Shared across all pages via <script> tag after the Supabase CDN script.
 */

const SUPABASE_URL = 'https://pnxwmyqiiycfawvrflco.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tC3cD6utlF9sQ4Gt2ozEFg_2ARA8VKp';

// The CDN exposes `supabase` as a global object with createClient
const { createClient } = supabase;
window._supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
