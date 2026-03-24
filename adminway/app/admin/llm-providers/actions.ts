"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLlmProvider(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("llm_providers").insert({
    name: formData.get("name") as string,
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  return {};
}

export async function updateLlmProvider(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("llm_providers")
    .update({ name: formData.get("name") as string, modified_by_user_id: userId })
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
