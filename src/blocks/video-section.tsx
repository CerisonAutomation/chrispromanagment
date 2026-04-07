// =============================================================================
// CANONICAL PUCK VIDEO SECTION BLOCK
// YouTube/Vimeo video embed with thumbnail
// =============================================================================

export const VideoSection = {
  label: "Video Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    videoUrl: { type: "text" as const, label: "YouTube/Vimeo Embed URL" },
    thumbnailUrl: { type: "text" as const, label: "Thumbnail Image URL" },
    aspectRatio: {
      type: "select" as const,
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
    },
  },
  defaultProps: {
    title: "Watch Our Story",
    description: "Discover how we deliver exceptional property management across Malta.",
    videoUrl: "",
    thumbnailUrl: "",
    aspectRatio: "16:9",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      aspectRatio: string;
    };
    const aspectClass = p.aspectRatio === "4:3" ? "aspect-[4/3]" : p.aspectRatio === "1:1" ? "aspect-square" : "aspect-video";
    // Extract embed URL from YouTube/Vimeo
    let embedUrl = "";
    if (p.videoUrl) {
      if (p.videoUrl.includes("youtube.com/watch")) {
        const vid = new URL(p.videoUrl).searchParams.get("v");
        if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
      } else if (p.videoUrl.includes("youtu.be/")) {
        const vid = p.videoUrl.split("youtu.be/")[1]?.split("?")[0];
        if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
      } else if (p.videoUrl.includes("vimeo.com/")) {
        const vid = p.videoUrl.split("vimeo.com/")[1]?.split("?")[0];
        if (vid) embedUrl = `https://player.vimeo.com/video/${vid}`;
      } else {
        embedUrl = p.videoUrl;
      }
    }
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              {p.title && <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>}
              {p.title && <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />}
              {p.description && <p className="mt-4 text-base text-cpm-text-secondary">{p.description}</p>}
            </div>
            <div
              className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-500 hover:border-cpm-accent/20 hover:shadow-[0_0_30px_rgba(200,169,106,0.08)]"
              style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}
            >
              <div className={aspectClass}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={p.title || "Video"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cpm-bg-secondary">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cpm-accent/20 bg-cpm-accent/10">
                        <svg className="h-7 w-7 text-cpm-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-cpm-text-secondary">Video Coming Soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Embedded video section (YouTube/Vimeo). Professional presentation with play overlay. Support 16:9, 4:3, 1:1." },
};