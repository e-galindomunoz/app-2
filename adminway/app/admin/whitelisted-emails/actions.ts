"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWhitelistedEmail(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("whitelist_email_addresses").insert({
    email_address: (formData.get("email") as string).toLowerCase().trim(),
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/whitelisted-emails");
  return {};
}

export async function updateWhitelistedEmail(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("whitelist_email_addresses").update({
    email_address: (formData.get("email") as string).toLowerCase().trim(),
    modified_by_user_id: userId,
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/whitelisted-emails");
  return {};
}

export async function deleteWhitelistedEmail(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/whitelisted-emails");
  return {};
}
