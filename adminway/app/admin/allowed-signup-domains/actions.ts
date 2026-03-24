"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAllowedDomain(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("allowed_signup_domains").insert({
    apex_domain: (formData.get("domain") as string).toLowerCase().trim(),
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return {};
}

export async function updateAllowedDomain(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("allowed_signup_domains").update({
    apex_domain: (formData.get("domain") as string).toLowerCase().trim(),
    modified_by_user_id: userId,
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return {};
}

export async function deleteAllowedDomain(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return {};
}
