import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lloflpakhcnmrhedvkvp.supabase.co';
const supabaseKey = 'sb_publishable_MHpydyB5qIPedDk0opkSZw_BHtvjmiQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success, data length:', data.length);
  }
}

test();
