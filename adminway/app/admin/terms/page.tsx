import { createAnonClient } from "@/lib/supabase/server";
import { TermsTable } from "@/components/admin/terms-table";
import type { Term, TermType } from "@/lib/types";

export default async function TermsPage() {
  const supabase = createAnonClient();
  const [{ data: terms }, { data: termTypes }] = await Promise.all([
    supabase.from("terms").select("*").order("term", { ascending: true }),
    supabase.from("term_types").select("id, name").order("name", { ascending: true }),
  ]);

  return <TermsTable items={(terms as Term[]) ?? []} termTypes={(termTypes as TermType[]) ?? []} />;
}
