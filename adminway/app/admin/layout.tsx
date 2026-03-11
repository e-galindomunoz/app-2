import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) {
    redirect("/unauthorized");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#000" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header email={user.email ?? null} />
        <main
          className="bg-grid"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
