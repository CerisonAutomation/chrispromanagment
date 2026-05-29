/**
 * Property Showcase Block - Stub file
 */

import React from "react";

export const PropertyShowcase = {
  label: "Property Showcase",
  defaultProps: {
    title: "Featured Properties",
    count: 3,
  },
  render: ({ title, count }: { title: string; count: number }) => (
    <div className="py-12 px-4">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <p>Showing {count} properties</p>
    </div>
  ),
};

export default PropertyShowcase;
