import { createAnonClient } from "@/lib/supabase/server";
import { ImageForm } from "@/components/images/image-form";
import { createImage } from "../actions";

export default async function NewImagePage() {
  const supabase = createAnonClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .order("email");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--jade)",
            marginBottom: "0.25rem",
          }}
        >
          New Image
        </h1>
        <div
          style={{
            fontSize: "0.625rem",
            color: "var(--jade-muted)",
            letterSpacing: "0.1em",
          }}
        >
          Add a new image by URL
        </div>
      </div>

      <div
        className="stat-card"
        style={{ maxWidth: "680px", padding: "2rem" }}
      >
        <ImageForm profiles={profiles ?? []} action={createImage} />
      </div>
    </div>
  );
}
