import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env file
const envPath = path.resolve('./.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      brackets (
        id,
        score,
        is_submitted
      )
    `);

  if (error) {
    console.error('Error fetching profiles and brackets:', error);
  } else {
    console.log('--- LEADERBOARD RELATIONAL QUERY RESULT ---');
    console.log(JSON.stringify(data, null, 2));
  }
}

inspect();
