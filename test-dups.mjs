import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from("students").select("*");
  console.log("Total students in DB:", data.length);
  
  // count duplicates
  const map = {};
  for (const s of data) {
    const key = `${s.assignment_id}_${s.full_name}`;
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  
  let dups = 0;
  for (const key in map) {
    if (map[key].length > 1) {
      dups += map[key].length - 1;
    }
  }
  console.log("Total duplicates found:", dups);
}
check();
