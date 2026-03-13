"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("whitelist_email_addresses").insert({
    email_address: (formData.get("email") as string).toLowerCase().trim(),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/whitelisted-emails");
  return {};
}

export async function updateWhitelistedEmail(id: number, formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("whitelist_email_addresses").update({
    email_address: (formData.get("email") as string).toLowerCase().trim(),
    modified_datetime_utc: new Date().toISOString(),
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
