"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLlmModel(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("llm_models").insert({
    name: formData.get("name") as string,
    llm_provider_id: Number(formData.get("llm_provider_id")),
    provider_model_id: formData.get("provider_model_id") as string,
    is_temperature_supported: formData.get("is_temperature_supported") === "on",
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  return {};
}

export async function updateLlmModel(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("llm_models")
    .update({
      name: formData.get("name") as string,
      llm_provider_id: Number(formData.get("llm_provider_id")),
      provider_model_id: formData.get("provider_model_id") as string,
      is_temperature_supported: formData.get("is_temperature_supported") === "on",
      modified_by_user_id: userId,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  return {};
}

export async function deleteLlmModel(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  return {};
}
