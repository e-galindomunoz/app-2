"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTerm(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const termTypeRaw = formData.get("term_type_id");
  const { error } = await supabase.from("terms").insert({
    term: formData.get("term") as string,
    definition: formData.get("definition") as string,
    example: formData.get("example") as string,
    priority: Number(formData.get("priority") ?? 0),
    term_type_id: termTypeRaw ? Number(termTypeRaw) : null,
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return {};
}

export async function updateTerm(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("terms")
    .update({
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      example: formData.get("example") as string,
      priority: Number(formData.get("priority") ?? 0),
      term_type_id: formData.get("term_type_id") ? Number(formData.get("term_type_id")) : null,
      modified_by_user_id: userId,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return {};
}

export async function deleteTerm(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return {};
}
