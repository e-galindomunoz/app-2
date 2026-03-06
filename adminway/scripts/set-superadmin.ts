import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run set-superadmin <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, is_superadmin")
    .eq("email", email)
    .single();

  if (error || !profile) {
    console.error(`No profile found for email: ${email}`);
    console.error("Make sure the user has signed in at least once.");
    process.exit(1);
  }

  if (profile.is_superadmin) {
    console.log(`✓ ${email} is already a superadmin.`);
    process.exit(0);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_superadmin: true })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Failed to update:", updateError.message);
    process.exit(1);
  }

  console.log(`✓ ${email} has been promoted to superadmin.`);
}

main();
