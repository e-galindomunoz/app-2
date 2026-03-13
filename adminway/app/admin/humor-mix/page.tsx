import { createAnonClient } from "@/lib/supabase/server";
import { HumorMixTable } from "@/components/admin/humor-mix-table";
import type { HumorFlavorMix, HumorFlavor } from "@/lib/types";

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HumorMixPage({ searchParams }: Props) {
  const { sort = "count_desc" } = await searchParams;
  const supabase = createAnonClient();

  let query = supabase.from("humor_flavor_mix").select("*");

  if (sort === "count_asc") query = query.order("caption_count", { ascending: true });
  else if (sort === "newest") query = query.order("created_datetime_utc", { ascending: false });
  else if (sort === "oldest") query = query.order("created_datetime_utc", { ascending: true });
  else query = query.order("caption_count", { ascending: false });

  const [{ data: mix }, { data: flavors }] = await Promise.all([
    query,
    supabase.from("humor_flavors").select("id, slug").order("slug", { ascending: true }),
  ]);

  return (
    <HumorMixTable
      items={(mix as HumorFlavorMix[]) ?? []}
      flavors={(flavors as Pick<HumorFlavor, "id" | "slug">[]) ?? []}
      sort={sort}
    />
  );
}
