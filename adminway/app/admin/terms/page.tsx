import { createAnonClient } from "@/lib/supabase/server";
import { TermsTable } from "@/components/admin/terms-table";
import type { Term } from "@/lib/types";

export default async function TermsPage() {
  const supabase = createAnonClient();
  const { data: terms } = await supabase
    .from("terms")
    .select("*")
    .order("term", { ascending: true });

  return <TermsTable items={(terms as Term[]) ?? []} />;
}
