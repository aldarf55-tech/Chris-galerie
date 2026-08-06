import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xzxkatftpfmkvhxrxgsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGthdGZ0cGZta3ZoeHJ4Z3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjIyMjgsImV4cCI6MjEwMTIzODIyOH0.3dPF4DHcewRAAzhzlYml3JxRDvJwS7h6yK-YaNUrjuw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);