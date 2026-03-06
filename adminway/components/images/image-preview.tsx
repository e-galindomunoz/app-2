"use client";

interface Props {
  src: string;
}

export function ImagePreview({ src }: Props) {
  return (
    <div
      style={{
        height: "160px",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid var(--jade-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = "0.3";
        }}
      />
    </div>
  );
}
