import { createAnonClient } from "@/lib/supabase/server";
import { LlmModelsTable } from "@/components/admin/llm-models-table";
import type { LlmModel, LlmProvider } from "@/lib/types";

export default async function LlmModelsPage() {
  const supabase = createAnonClient();
  const [{ data: models }, { data: providers }] = await Promise.all([
    supabase.from("llm_models").select("*").order("name", { ascending: true }),
    supabase.from("llm_providers").select("*").order("name", { ascending: true }),
  ]);

  return (
    <LlmModelsTable
      items={(models as LlmModel[]) ?? []}
      providers={(providers as LlmProvider[]) ?? []}
    />
  );
}
