import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanDuplicates() {
  const { data: students, error } = await supabase.from("students").select("*");
  if (error) {
    console.error(error);
    return;
  }
  
  // Group by assignment_id + full_name
  const map = {};
  for (const s of students) {
    const key = `${s.assignment_id}_${s.full_name}`;
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  
  const toDelete = [];
  for (const key in map) {
    const group = map[key];
    if (group.length > 1) {
      // Sort by created_at DESC (newest first)
      group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Keep the first (newest), delete the rest
      for (let i = 1; i < group.length; i++) {
        toDelete.push(group[i].id);
      }
    }
  }
  
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate students...`);
    
    // Delete in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      const { error: delError } = await supabase.from("students").delete().in("id", chunk);
      if (delError) {
        console.error("Error deleting chunk:", delError);
      } else {
        console.log(`Deleted chunk ${i/chunkSize + 1}`);
      }
    }
    console.log("Cleanup complete!");
  } else {
    console.log("No duplicates found to delete.");
  }
}
cleanDuplicates();
