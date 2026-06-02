import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://altfgsmuwbifuojirugg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdGZnc211d2JpZnVvamlydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTc2NjksImV4cCI6MjA5NTgzMzY2OX0.2Xf4hOr8aXW9Qa5e-oS3KKg3ojuedbE5VFDFwEpJz44';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
