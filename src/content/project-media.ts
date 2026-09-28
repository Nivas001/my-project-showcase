/**
 * Curated project media, served from public/media/<slug>/.
 *
 * GENERATED from the screenshots in asset/ and from fresh captures of the live
 * sites (1440×900 viewport, WebP). Each image carries its real size, so every
 * frame on the site can be cut to the exact shape of the picture inside it.
 *
 *   screens  what a visitor sees on one screen — carousels, cards, covers
 *   designs  whole pages, top to bottom — the zoomable design board
 *
 * For a slug listed here these take precedence over the rows in the
 * database (whose design files are missing from storage). Projects not listed
 * keep whatever the admin panel uploaded.
 */

export type Media = { src: string; w: number; h: number; label: string };
export type ProjectMedia = { screens: Media[]; designs: Media[] };

export const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  anibakes: {
    screens: [
      { src: "/media/anibakes/screen-01-home.webp", w: 1440, h: 900, label: "Home" },
      {
        src: "/media/anibakes/screen-02-fresh-from-the-counter.webp",
        w: 1440,
        h: 710,
        label: "Fresh from the counter",
      },
      { src: "/media/anibakes/screen-03-shop.webp", w: 1440, h: 900, label: "Shop" },
      {
        src: "/media/anibakes/screen-04-product-detail.webp",
        w: 1440,
        h: 900,
        label: "Product detail",
      },
      { src: "/media/anibakes/screen-05-offers.webp", w: 1440, h: 710, label: "Offers" },
      {
        src: "/media/anibakes/screen-06-checkout-slot-booking.webp",
        w: 1440,
        h: 710,
        label: "Checkout — slot booking",
      },
      { src: "/media/anibakes/screen-07-your-orders.webp", w: 1440, h: 710, label: "Your orders" },
      { src: "/media/anibakes/screen-08-reviews.webp", w: 1440, h: 710, label: "Reviews" },
      { src: "/media/anibakes/screen-09-gallery.webp", w: 1440, h: 710, label: "Gallery" },
      { src: "/media/anibakes/screen-10-about.webp", w: 1440, h: 900, label: "About" },
      {
        src: "/media/anibakes/screen-11-admin-analytics.webp",
        w: 1440,
        h: 710,
        label: "Admin — analytics",
      },
      {
        src: "/media/anibakes/screen-12-admin-orders.webp",
        w: 1440,
        h: 900,
        label: "Admin — orders",
      },
      {
        src: "/media/anibakes/screen-13-admin-bake-sheet.webp",
        w: 1440,
        h: 710,
        label: "Admin — bake sheet",
      },
      {
        src: "/media/anibakes/screen-14-admin-catalogue.webp",
        w: 1440,
        h: 900,
        label: "Admin — catalogue",
      },
      {
        src: "/media/anibakes/screen-15-admin-reviews.webp",
        w: 1440,
        h: 900,
        label: "Admin — reviews",
      },
      {
        src: "/media/anibakes/screen-16-admin-promo-codes.webp",
        w: 1440,
        h: 710,
        label: "Admin — promo codes",
      },
    ],
    designs: [
      { src: "/media/anibakes/design-01-home.webp", w: 1200, h: 4908, label: "Home" },
      { src: "/media/anibakes/design-02-shop.webp", w: 1200, h: 1112, label: "Shop" },
      {
        src: "/media/anibakes/design-03-product-detail.webp",
        w: 1200,
        h: 2739,
        label: "Product detail",
      },
      { src: "/media/anibakes/design-04-offers.webp", w: 1200, h: 1768, label: "Offers" },
      { src: "/media/anibakes/design-05-orders.webp", w: 1200, h: 1916, label: "Orders" },
      { src: "/media/anibakes/design-06-about.webp", w: 1200, h: 3916, label: "About" },
      {
        src: "/media/anibakes/design-07-admin-catalogue.webp",
        w: 1200,
        h: 2182,
        label: "Admin — catalogue",
      },
      {
        src: "/media/anibakes/design-08-admin-orders.webp",
        w: 1200,
        h: 1575,
        label: "Admin — orders",
      },
      {
        src: "/media/anibakes/design-09-admin-gallery.webp",
        w: 1200,
        h: 980,
        label: "Admin — gallery",
      },
      {
        src: "/media/anibakes/design-10-admin-newsletter.webp",
        w: 1200,
        h: 918,
        label: "Admin — newsletter",
      },
      {
        src: "/media/anibakes/design-11-admin-reviews.webp",
        w: 1200,
        h: 846,
        label: "Admin — reviews",
      },
      {
        src: "/media/anibakes/design-12-admin-categories.webp",
        w: 1200,
        h: 738,
        label: "Admin — categories",
      },
    ],
  },
  "aarrkkaa-international": {
    screens: [
      { src: "/media/aarrkkaa-international/screen-01-home.webp", w: 1440, h: 900, label: "Home" },
      {
        src: "/media/aarrkkaa-international/screen-02-products.webp",
        w: 1440,
        h: 900,
        label: "Products",
      },
      {
        src: "/media/aarrkkaa-international/screen-03-product-range.webp",
        w: 1440,
        h: 900,
        label: "Product range",
      },
      {
        src: "/media/aarrkkaa-international/screen-04-product-spec.webp",
        w: 1440,
        h: 900,
        label: "Product spec",
      },
      {
        src: "/media/aarrkkaa-international/screen-05-find-my-seal-wizard.webp",
        w: 1440,
        h: 710,
        label: "Find-my-seal wizard",
      },
      {
        src: "/media/aarrkkaa-international/screen-06-industries.webp",
        w: 1440,
        h: 900,
        label: "Industries",
      },
      {
        src: "/media/aarrkkaa-international/screen-07-about.webp",
        w: 1440,
        h: 900,
        label: "About",
      },
      {
        src: "/media/aarrkkaa-international/screen-08-request-a-quote.webp",
        w: 1440,
        h: 900,
        label: "Request a quote",
      },
      {
        src: "/media/aarrkkaa-international/screen-09-easter-egg.webp",
        w: 1440,
        h: 900,
        label: "Easter egg",
      },
      { src: "/media/aarrkkaa-international/screen-10-404.webp", w: 1440, h: 900, label: "404" },
      {
        src: "/media/aarrkkaa-international/screen-11-admin-dashboard.webp",
        w: 1440,
        h: 710,
        label: "Admin — dashboard",
      },
      {
        src: "/media/aarrkkaa-international/screen-12-admin-analytics.webp",
        w: 1440,
        h: 900,
        label: "Admin — analytics",
      },
      {
        src: "/media/aarrkkaa-international/screen-13-admin-products.webp",
        w: 1440,
        h: 900,
        label: "Admin — products",
      },
      {
        src: "/media/aarrkkaa-international/screen-14-admin-hero-carousel.webp",
        w: 1440,
        h: 710,
        label: "Admin — hero carousel",
      },
      {
        src: "/media/aarrkkaa-international/screen-15-admin-enquiries.webp",
        w: 1440,
        h: 710,
        label: "Admin — enquiries",
      },
    ],
    designs: [
      { src: "/media/aarrkkaa-international/design-01-home.webp", w: 1200, h: 4574, label: "Home" },
      {
        src: "/media/aarrkkaa-international/design-02-products.webp",
        w: 1200,
        h: 2276,
        label: "Products",
      },
      {
        src: "/media/aarrkkaa-international/design-03-product-range.webp",
        w: 1200,
        h: 2132,
        label: "Product range",
      },
      {
        src: "/media/aarrkkaa-international/design-04-product-spec.webp",
        w: 1200,
        h: 1786,
        label: "Product spec",
      },
      {
        src: "/media/aarrkkaa-international/design-05-industries.webp",
        w: 1200,
        h: 3972,
        label: "Industries",
      },
      {
        src: "/media/aarrkkaa-international/design-06-about.webp",
        w: 1200,
        h: 2374,
        label: "About",
      },
      {
        src: "/media/aarrkkaa-international/design-07-contact.webp",
        w: 1200,
        h: 1910,
        label: "Contact",
      },
      { src: "/media/aarrkkaa-international/design-08-404.webp", w: 1200, h: 989, label: "404" },
      {
        src: "/media/aarrkkaa-international/design-09-ask-arka-chatbot.webp",
        w: 400,
        h: 520,
        label: "Ask ARKA chatbot",
      },
      {
        src: "/media/aarrkkaa-international/design-10-admin-analytics.webp",
        w: 1200,
        h: 1100,
        label: "Admin — analytics",
      },
      {
        src: "/media/aarrkkaa-international/design-11-admin-edit-product.webp",
        w: 1200,
        h: 1087,
        label: "Admin — edit product",
      },
      {
        src: "/media/aarrkkaa-international/design-12-admin-categories.webp",
        w: 1200,
        h: 1049,
        label: "Admin — categories",
      },
    ],
  },
  "estate-ulagam": {
    screens: [
      { src: "/media/estate-ulagam/screen-01-home.webp", w: 1440, h: 900, label: "Home" },
      {
        src: "/media/estate-ulagam/screen-02-explore-listings.webp",
        w: 1440,
        h: 900,
        label: "Explore listings",
      },
      {
        src: "/media/estate-ulagam/screen-03-country-page.webp",
        w: 1440,
        h: 900,
        label: "Country page",
      },
      {
        src: "/media/estate-ulagam/screen-04-property-detail.webp",
        w: 1440,
        h: 900,
        label: "Property detail",
      },
      { src: "/media/estate-ulagam/screen-05-packages.webp", w: 1440, h: 900, label: "Packages" },
      {
        src: "/media/estate-ulagam/screen-06-for-sellers.webp",
        w: 1440,
        h: 900,
        label: "For sellers",
      },
      { src: "/media/estate-ulagam/screen-07-about.webp", w: 1440, h: 900, label: "About" },
    ],
    designs: [
      { src: "/media/estate-ulagam/design-01-home.webp", w: 1200, h: 7200, label: "Home" },
      {
        src: "/media/estate-ulagam/design-02-explore-listings.webp",
        w: 1200,
        h: 4690,
        label: "Explore listings",
      },
      {
        src: "/media/estate-ulagam/design-03-country-page.webp",
        w: 1200,
        h: 7200,
        label: "Country page",
      },
      {
        src: "/media/estate-ulagam/design-04-property-detail.webp",
        w: 1200,
        h: 3825,
        label: "Property detail",
      },
      { src: "/media/estate-ulagam/design-05-packages.webp", w: 1200, h: 5618, label: "Packages" },
      {
        src: "/media/estate-ulagam/design-06-for-sellers.webp",
        w: 1200,
        h: 1292,
        label: "For sellers",
      },
      { src: "/media/estate-ulagam/design-07-about.webp", w: 1200, h: 7200, label: "About" },
    ],
  },
  "vaaram-magazine": {
    screens: [
      { src: "/media/vaaram-magazine/screen-01-home.webp", w: 1440, h: 900, label: "Home" },
      { src: "/media/vaaram-magazine/screen-02-archives.webp", w: 1440, h: 900, label: "Archives" },
      {
        src: "/media/vaaram-magazine/screen-03-edition-reader.webp",
        w: 1440,
        h: 900,
        label: "Edition reader",
      },
      { src: "/media/vaaram-magazine/screen-04-about.webp", w: 1440, h: 900, label: "About" },
      { src: "/media/vaaram-magazine/screen-05-contact.webp", w: 1440, h: 900, label: "Contact" },
    ],
    designs: [
      { src: "/media/vaaram-magazine/design-01-home.webp", w: 1200, h: 7077, label: "Home" },
      {
        src: "/media/vaaram-magazine/design-02-archives.webp",
        w: 1200,
        h: 3657,
        label: "Archives",
      },
      {
        src: "/media/vaaram-magazine/design-03-edition-reader.webp",
        w: 1200,
        h: 4686,
        label: "Edition reader",
      },
      { src: "/media/vaaram-magazine/design-04-about.webp", w: 1200, h: 7200, label: "About" },
      { src: "/media/vaaram-magazine/design-05-contact.webp", w: 1200, h: 2514, label: "Contact" },
    ],
  },
  velocity: {
    screens: [
      { src: "/media/velocity/screen-01-home.webp", w: 1440, h: 900, label: "Home" },
      { src: "/media/velocity/screen-02-premium.webp", w: 1440, h: 900, label: "Premium" },
      {
        src: "/media/velocity/screen-03-architecture.webp",
        w: 1440,
        h: 900,
        label: "Architecture",
      },
      { src: "/media/velocity/screen-04-security.webp", w: 1440, h: 900, label: "Security" },
      { src: "/media/velocity/screen-05-install.webp", w: 1440, h: 900, label: "Install" },
      { src: "/media/velocity/screen-06-changelog.webp", w: 1440, h: 900, label: "Changelog" },
      { src: "/media/velocity/screen-07-support.webp", w: 1440, h: 900, label: "Support" },
    ],
    designs: [
      { src: "/media/velocity/design-01-home.webp", w: 1200, h: 1011, label: "Home" },
      { src: "/media/velocity/design-02-premium.webp", w: 1200, h: 1812, label: "Premium" },
      {
        src: "/media/velocity/design-03-architecture.webp",
        w: 1200,
        h: 1945,
        label: "Architecture",
      },
      { src: "/media/velocity/design-04-security.webp", w: 1200, h: 1838, label: "Security" },
      { src: "/media/velocity/design-05-install.webp", w: 1200, h: 934, label: "Install" },
      { src: "/media/velocity/design-06-changelog.webp", w: 1200, h: 5095, label: "Changelog" },
    ],
  },
};

/** Width ÷ height for a known image, or undefined for one this file has not seen. */
const RATIOS = new Map<string, number>(
  Object.values(PROJECT_MEDIA).flatMap((m) =>
    [...m.screens, ...m.designs].map((x) => [x.src, x.w / x.h] as const),
  ),
);
export function ratioOf(src: string | undefined): number | undefined {
  return src ? RATIOS.get(src) : undefined;
}

/** The label for a known image, used as its caption and alt text. */
const LABELS = new Map<string, string>(
  Object.values(PROJECT_MEDIA).flatMap((m) =>
    [...m.screens, ...m.designs].map((x) => [x.src, x.label] as const),
  ),
);
export function labelOf(src: string | undefined): string | undefined {
  return src ? LABELS.get(src) : undefined;
}
