import { Helmet } from "react-helmet-async";

export const SEO = ({ title, description, image, url, type = "website", keywords }) => {
  const baseTitle = "Christiano Property Management | Malta Vacation Rentals";
  const baseDesc = "Malta's premier luxury short-term rental management company.";
  
  const finalTitle = title ? String(title) + " | Christiano PM" : baseTitle;
  const finalDesc = description ? String(description) : baseDesc;
  const finalImage = image || "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1200";
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : "");
  const finalKeywords = keywords || "malta property, vacation rental malta";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export const PropertySEO = ({ property }) => {
  if (!property) return null;
  return (
    <SEO
      title={String(property.title || property.nickname || "Property")}
      description={String(property.publicDescription?.summary?.slice(0, 160) || "")}
      image={String(property.picture?.thumbnail || "")}
      type="lodging"
    />
  );
};
