const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://filluppmbagrzugmcqzb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGx1cHBtYmFncnp1Z21jcXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzYyNDEsImV4cCI6MjA1ODExMjI0MX0.-kpwNA0qqv_Q1odhvO4DnTLGhEF4cXSXAhwJkhruuxk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('your_table_name').select('*').limit(1);
    if (error) {
      console.error('Error querying Supabase:', error);
      process.exit(1);
    }
    console.log('Supabase connection successful. Sample data:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

testConnection();
