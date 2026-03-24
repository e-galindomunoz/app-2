"use server";

import { requireSuperadmin, createActionClient } from "@/lib/supabase/server";

export async function terminalList(
  table: string,
  options: { limit: number; search?: string; searchCols?: string[] }
) {
  await requireSuperadmin();
  const supabase = await createActionClient();
  let query = supabase.from(table).select("*").limit(options.limit);
  if (options.search && options.searchCols?.length) {
    const filter = options.searchCols
      .map((c) => `${c}.ilike.%${options.search}%`)
      .join(",");
    query = query.or(filter);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function terminalGet(table: string, id: string) {
  await requireSuperadmin();
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`no record found with id "${id}"`);
  return data as Record<string, unknown>;
}

export async function terminalDelete(table: string, id: string) {
  await requireSuperadmin();
  const supabase = await createActionClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function terminalCreate(
  table: string,
  data: Record<string, unknown>
) {
  const { userId } = await requireSuperadmin();
  const supabase = await createActionClient();
  const { data: result, error } = await supabase
    .from(table)
    .insert({ ...data, created_by_user_id: userId, modified_by_user_id: userId })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return result as Record<string, unknown> | null;
}

export async function terminalUpdate(
  table: string,
  id: string,
  data: Record<string, unknown>
) {
  const { userId } = await requireSuperadmin();
  const supabase = await createActionClient();
  const { data: result, error } = await supabase
    .from(table)
    .update({ ...data, modified_by_user_id: userId })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return result as Record<string, unknown> | null;
}
