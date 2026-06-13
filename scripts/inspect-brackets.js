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
  const { data: results, error: resultsError } = await supabase
    .from('tournament_results')
    .select('*')
    .eq('id', 'live')
    .single();

  if (resultsError) {
    console.error('Error fetching tournament results:', resultsError);
  } else {
    console.log('--- TOURNAMENT RESULTS ---');
    console.log('Is Locked:', results.is_locked);
    console.log('Completed Games:', results.results?.completed_games);
    console.log('Actual Matches Count:', Object.keys(results.results?.actual_matches || {}).length);
    console.log('Actual Matches:', JSON.stringify(results.results?.actual_matches, null, 2));
  }

  const { data: brackets, error: bracketsError } = await supabase
    .from('brackets')
    .select('*');

  if (bracketsError) {
    console.error('Error fetching brackets:', bracketsError);
  } else {
    console.log('\n--- USER BRACKETS ---');
    brackets.forEach(b => {
      console.log(`User ID: ${b.user_id}`);
      console.log(`  Is Submitted: ${b.is_submitted}`);
      console.log(`  Score: ${b.score}`);
      console.log(`  Predictions matched matches count:`, Object.keys(b.predictions?.groupMatches || {}).length);
      console.log(`  Predictions Match Keys:`, Object.keys(b.predictions?.groupMatches || {}));
      console.log(`  Predictions Match Values:`, JSON.stringify(b.predictions?.groupMatches));
    });
  }
}

inspect();
