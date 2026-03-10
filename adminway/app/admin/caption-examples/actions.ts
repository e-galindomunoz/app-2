"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("caption_examples").insert({
    image_description: formData.get("image_description") as string,
    caption: formData.get("caption") as string,
    explanation: formData.get("explanation") as string,
    priority: Number(formData.get("priority") ?? 0),
    image_id: (formData.get("image_id") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  return {};
}

export async function updateCaptionExample(id: number, formData: FormData) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase
    .from("caption_examples")
    .update({
      image_description: formData.get("image_description") as string,
      caption: formData.get("caption") as string,
      explanation: formData.get("explanation") as string,
      priority: Number(formData.get("priority") ?? 0),
      image_id: (formData.get("image_id") as string) || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  return {};
}

export async function deleteCaptionExample(id: number) {
  await requireSuperadmin();
  const supabase = createAnonClient();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  return {};
}
