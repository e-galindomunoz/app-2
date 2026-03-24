"use server";

import { createAnonClient, requireSuperadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHumorMix(id: number, formData: FormData) {
  const { userId } = await requireSuperadmin();
  const supabase = createAnonClient();
  const caption_count = parseInt(formData.get("caption_count") as string, 10);
  if (isNaN(caption_count) || caption_count < 0) return { error: "Invalid caption count" };
  const { error } = await supabase.from("humor_flavor_mix").update({ caption_count, modified_by_user_id: userId }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/humor-mix");
  return {};
}
