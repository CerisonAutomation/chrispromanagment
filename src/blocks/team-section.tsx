

export const TeamSection = {
  label: "Team Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    members: {
      type: "array" as const,
      label: "Team Members",
      defaultItemProps: { name: "Team Member", role: "Role", bio: "Short bio.", imageUrl: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Team Member",
      arrayFields: {
        name: { type: "text" as const },
        role: { type: "text" as const },
        bio: { type: "textarea" as const },
        imageUrl: { type: "text" as const, label: "Photo URL" },
      },
    },
  },
  defaultProps: {
    title: "Meet the Team",
    subtitle: "The dedicated professionals behind our success.",
    members: [
      { name: "Christiano", role: "Founder & CEO", bio: "With over 9 years of Superhost experience and a background in international luxury hotel management.", imageUrl: "" },
      { name: "Sarah", role: "Guest Relations Manager", bio: "Ensuring every guest receives a five-star experience from booking to checkout.", imageUrl: "" },
      { name: "James", role: "Operations Lead", bio: "Coordinating cleaning, maintenance, and property preparation to the highest standards.", imageUrl: "" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      subtitle: string;
      members: { name: string; role: string; bio: string; imageUrl: string }[];
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.subtitle && <p className="mt-4 text-base text-cpm-text-secondary">{p.subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(p.members || []).map((member, i) => {
                const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:shadow-[0_8px_30px_rgba(200,169,106,0.08)]"
                    style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.12}s both` }}
                  >
                    {/* Photo or initials */}
                    <div className="mx-auto mb-5 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-2 border-cpm-accent/20 transition-all duration-500 group-hover:border-cpm-accent/50 group-hover:shadow-[0_0_30px_rgba(200,169,106,0.15)]">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-2xl font-light"
                          style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                        >
                          <span className="text-cpm-bg-primary">{initials}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-cpm-accent">{member.role}</p>
                    <p className="text-sm leading-relaxed text-cpm-text-secondary">{member.bio}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  },
};