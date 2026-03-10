"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLlmProvider(formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("llm_providers").insert({
    name: formData.get("name") as string,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  return {};
}

export async function updateLlmProvider(id: number, formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("llm_providers")
    .update({ name: formData.get("name") as string })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  return {};
}

export async function deleteLlmProvider(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  return {};
}
