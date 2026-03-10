"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTerm(formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("terms").insert({
    term: formData.get("term") as string,
    definition: formData.get("definition") as string,
    example: formData.get("example") as string,
    priority: Number(formData.get("priority") ?? 0),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return {};
}

export async function updateTerm(id: number, formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("terms")
    .update({
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      example: formData.get("example") as string,
      priority: Number(formData.get("priority") ?? 0),
      modified_datetime_utc: new Date().toISOString(),
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
