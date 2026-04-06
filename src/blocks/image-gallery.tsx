import React from "react";
import { IMG_2625, IMG_9593, IMG_9588, IMG_9590, IMG_7136, IMG_6590 } from "./helpers";

export const ImageGallery = {
  label: "Image Gallery",
  fields: {
    title: { type: "text" as const },
    images: {
      type: "array" as const,
      label: "Images",
      defaultItemProps: { url: "", caption: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { caption?: string }).caption || "Image",
      arrayFields: {
        url: { type: "text" as const, label: "Image URL" },
        caption: { type: "text" as const },
      },
    },
    columns: { type: "select" as const, options: [{ label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }] },
  },
  defaultProps: {
    title: "Property Gallery",
    images: [
      { url: IMG_2625, caption: "Modern Living Space" },
      { url: IMG_9593, caption: "Sea View Terrace" },
      { url: IMG_9588, caption: "Luxury Bedroom" },
      { url: IMG_9590, caption: "Fully Equipped Kitchen" },
      { url: IMG_7136, caption: "Private Pool Area" },
      { url: IMG_6590, caption: "Rooftop Sunset" },
    ],
    columns: "3",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; images: { url: string; caption: string }[]; columns: string };
    const [lightbox, setLightbox] = React.useState<number | null>(null);
    const cols = p.columns === "2" ? "sm:grid-cols-2" : p.columns === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className={`grid ${cols} gap-3`}>
              {(p.images || []).map((img, i) => (
                <div key={i} className="group relative cursor-pointer overflow-hidden rounded-xl" style={{ animation: `scaleIn 0.4s ease-out ${i * 0.05}s both` }} onClick={() => setLightbox(i)}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={img.url} alt={img.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {img.caption && <p className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-sm font-medium text-cpm-text-primary opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">{img.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {lightbox !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cpm-bg-primary/95 backdrop-blur-md" onClick={() => setLightbox(null)}>
            <button className="absolute right-6 top-6 text-cpm-text-primary hover:text-cpm-accent z-10" onClick={() => setLightbox(null)}><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
              <img src={(p.images || [])[lightbox]?.url || ""} alt="" className="max-h-[80vh] rounded-2xl object-contain" />
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                <button onClick={() => setLightbox(Math.max(0, lightbox - 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border disabled:opacity-30" disabled={lightbox === 0}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
                <span className="text-sm text-cpm-text-secondary">{lightbox + 1} / {(p.images || []).length}</span>
                <button onClick={() => setLightbox(Math.min((p.images || []).length - 1, lightbox + 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={lightbox === (p.images || []).length - 1}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
};