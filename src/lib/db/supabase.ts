import { createClient } from "@supabase/supabase-js";
import variables from "@/config/variables.ts";

export const supabase = createClient(
  variables.SUPABASE_URL,
  variables.SUPABASE_KEY,
);
