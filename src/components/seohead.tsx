import { Helmet } from "react-helmet-async";
import { usePageSeo } from "@/hooks/use-page-seo";

/**
 * <SEOHead/> applies per-page SEO overrides on top of the sitewide
 * defaults declared in index.html. Pass `slug` to load from
 * `cms_page_seo`; pass inline props to override hardcoded routes.
 *
 * Precedence (highest → lowest):
 *   1. Inline props (title, description, ...)
 *   2. cms_page_seo row matched by slug
 *   3. index.html sitewide defaults (untouched)
 */
export default function SEOHead({
  slug,
  title,
  description,
  canonical,
  ogImage,
  ogType,
  robots,
  jsonLd,
}) {
  const { seo } = usePageSeo(slug);

  const effective = {
    title: title ?? seo?.meta_title,
    description: description ?? seo?.meta_description,
    canonical: canonical ?? seo?.canonical_url ?? (slug ? (slug === "home" ? "/" : `/${slug}`) : undefined),
    ogImage: ogImage ?? seo?.og_image,
    ogType: ogType ?? seo?.og_type ?? "website",
    robots: robots ?? seo?.robots ?? "index,follow",
    jsonLd: jsonLd ?? seo?.json_ld,
  };

  // Nothing to render — let index.html defaults apply
  if (
    !effective.title &&
    !effective.description &&
    !effective.canonical &&
    !effective.ogImage &&
    !effective.jsonLd
  ) {
    return null;
  }

  return (
    <Helmet>
      {effective.title ? <title>{effective.title}</title> : null}
      {effective.description ? <meta name="description" content={effective.description} /> : null}
      {effective.canonical ? <link rel="canonical" href={effective.canonical} /> : null}
      {effective.robots ? <meta name="robots" content={effective.robots} /> : null}
      {effective.title ? <meta property="og:title" content={effective.title} /> : null}
      {effective.description ? <meta property="og:description" content={effective.description} /> : null}
      {effective.canonical ? <meta property="og:url" content={effective.canonical} /> : null}
      {effective.ogType ? <meta property="og:type" content={effective.ogType} /> : null}
      {effective.ogImage ? <meta property="og:image" content={effective.ogImage} /> : null}
      {effective.jsonLd ? (
        <script type="application/ld+json">
          {typeof effective.jsonLd === "string" ? effective.jsonLd : JSON.stringify(effective.jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
