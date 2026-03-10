import { createAnonClient } from "@/lib/supabase/server";
import { AllowedDomainsTable } from "@/components/admin/allowed-domains-table";
import type { AllowedSignupDomain } from "@/lib/types";

export default async function AllowedSignupDomainsPage() {
  const supabase = createAnonClient();
  const { data: domains } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .order("domain", { ascending: true });

  return <AllowedDomainsTable items={(domains as AllowedSignupDomain[]) ?? []} />;
}
