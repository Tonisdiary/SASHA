import { supabaseClient } from './supabaseClient';

export async function saveData(table: string, data: any) {
  const { error } = await supabaseClient.from(table).insert([data]);
  if (error) throw error;
}
