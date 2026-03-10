import { createAnonClient } from "@/lib/supabase/server";
import { LlmProvidersTable } from "@/components/admin/llm-providers-table";
import type { LlmProvider } from "@/lib/types";

export default async function LlmProvidersPage() {
  const supabase = createAnonClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("*")
    .order("name", { ascending: true });

  return <LlmProvidersTable items={(providers as LlmProvider[]) ?? []} />;
}
