"use client";

import React from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

export const FaqSection = {
  label: "FAQ Section",
  fields: {
    title: { type: "text" as const },
    items: { type: "array" as const, label: "FAQ Items" },
  },
  defaultProps: {
    title: "Frequently Asked Questions",
    items: [
      { question: "What services do you offer?", answer: "We offer luxury property management services." },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const { title, items } = props as { title: string; items: FaqItem[] };
    return <FaqComponent title={title} items={items} />;
  },
};

const FaqComponent: React.FC<FaqSectionProps> = React.memo(({ title, items }) => {
  const [search, setSearch] = React.useState("");
  const [allOpen, setAllOpen] = React.useState(false);

  const filteredItems = search
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
        </div>

        {items.length > 0 && (
          <div className="mb-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50"
            />
          </div>
        )}

        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-cpm-border bg-cpm-bg-secondary overflow-hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left font-medium text-cpm-text-primary transition-all hover:bg-cpm-bg-tertiary">
                <span>{item.question}</span>
                <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-cpm-accent/10 text-cpm-accent transition-transform duration-300 group-open:rotate-180">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-4 pt-2">
                <p className="text-sm text-cpm-text-secondary">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-cpm-text-tertiary">No matching questions found.</p>
        )}
      </div>
    </section>
  );
});

FaqComponent.displayName = "FaqComponent";