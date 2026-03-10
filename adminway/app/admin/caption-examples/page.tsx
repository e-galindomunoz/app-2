import { createAnonClient } from "@/lib/supabase/server";
import { CaptionExamplesTable } from "@/components/admin/caption-examples-table";
import type { CaptionExample } from "@/lib/types";

export default async function CaptionExamplesPage() {
  const supabase = createAnonClient();
  const { data: examples } = await supabase
    .from("caption_examples")
    .select("*")
    .order("priority", { ascending: false });

  return <CaptionExamplesTable items={(examples as CaptionExample[]) ?? []} />;
}
