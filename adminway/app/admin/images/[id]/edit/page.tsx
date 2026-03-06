import { notFound } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/server";
import { ImageForm } from "@/components/images/image-form";
import { updateImage } from "../../actions";
import type { Image as ImageType } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditImagePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAnonClient();

  const [{ data: image }, { data: profiles }] = await Promise.all([
    supabase.from("images").select("*").eq("id", id).single(),
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .order("email"),
  ]);

  if (!image) notFound();

  async function updateImageAction(formData: FormData) {
    "use server";
    return updateImage(id, formData);
  }

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
          Edit Image
        </h1>
        <div
          style={{
            fontSize: "0.625rem",
            color: "var(--jade-muted)",
            letterSpacing: "0.1em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "500px",
          }}
        >
          {(image as ImageType).url}
        </div>
      </div>

      <div
        className="stat-card"
        style={{ maxWidth: "680px", padding: "2rem" }}
      >
        <ImageForm
          image={image as ImageType}
          profiles={profiles ?? []}
          action={updateImageAction}
        />
      </div>
    </div>
  );
}
