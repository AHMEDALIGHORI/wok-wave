import { SiteShell } from "@/components/site-shell";
import { site } from "@/site.config";
export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}/posters/${site.dishes[0].id}.webp`,
    servesCuisine: site.cuisine,
    address: site.address,
    openingHours: site.openingHours,
    priceRange: site.priceRange,
    hasMap: site.mapUrl,
    sameAs: [site.instagramUrl],
    acceptsReservations: site.bookingUrl,
    hasMenu: {
      "@type": "Menu",
      url: `${site.url}/#menu`,
      hasMenuSection: site.categories
        .filter((c) => c.id !== "all")
        .map((c) => ({
          "@type": "MenuSection",
          name: c.label,
          hasMenuItem: site.menu
            .filter((m) => m.category === c.id)
            .map((m) => ({
              "@type": "MenuItem",
              name: m.name,
              description: m.description,
              offers: {
                "@type": "Offer",
                price: m.price,
                priceCurrency: site.currency,
              },
            })),
        })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <SiteShell />
    </>
  );
}
