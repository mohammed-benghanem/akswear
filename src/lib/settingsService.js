import { supabase } from "./supabase";

export const fetchSettings = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
};

export const saveSettings = async (updates) => {
  const { error } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", 1);
  if (error) throw error;
};
