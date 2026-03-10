import { createAnonClient } from "@/lib/supabase/server";
import { WhitelistedEmailsTable } from "@/components/admin/whitelisted-emails-table";
import type { WhitelistedEmail } from "@/lib/types";

export default async function WhitelistedEmailsPage() {
  const supabase = createAnonClient();
  const { data: emails } = await supabase
    .from("whitelist_email_addresses")
    .select("*")
    .order("email", { ascending: true });

  return <WhitelistedEmailsTable items={(emails as WhitelistedEmail[]) ?? []} />;
}
