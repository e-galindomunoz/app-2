"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parseFormData(formData: FormData) {
  return {
    url: formData.get("url") as string,
    profile_id: (formData.get("profile_id") as string) || null,
    is_public: formData.get("is_public") === "on",
    is_common_use: formData.get("is_common_use") === "on",
    additional_context: (formData.get("additional_context") as string) || null,
    image_description: (formData.get("image_description") as string) || null,
  };
}

export async function createImage(formData: FormData) {
  const { userId } = await requireSuperadmin();
  const admin = createAnonClient();
  const { error } = await admin.from("images").insert({
    ...parseFormData(formData),
    created_by_user_id: userId,
    modified_by_user_id: userId,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  return {};
}

export async function updateImage(id: string, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const admin = createAnonClient();
  const fields = {
    ...parseFormData(formData),
    modified_by_user_id: userId,
  };

  const { error } = await admin.from("images").update(fields).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  return {};
}

export async function deleteImage(id: string) {
  await requireSuperadmin();
  const admin = createAnonClient();
  const { error } = await admin.from("images").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  return {};
}
