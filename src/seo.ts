import { HERO_IMAGE_SRC, ROUTES } from "./siteData";

const SITE_URL = "https://centralkastoriahouses.gr";
const DEFAULT_OG_IMAGE = `${SITE_URL}${HERO_IMAGE_SRC}`;
const MANAGED_ATTR = "data-seo-managed";

type SeoEntry = {
  title: string;
  description: string;
  keywords: string;
  type?: "website" | "article";
  noindex?: boolean;
  image?: string;
};

const commonKeywords =
  "Kastoria apartments, apartments in Kastoria, rent apartment Kastoria, short stay Kastoria, Papareska 20 Kastoria, Καστοριά διαμερίσματα, ενοικιαζόμενα διαμερίσματα Καστοριά, διαμονή Καστοριά, κατάλυμα Καστοριά, διακοπές Καστοριά";

const routeSeoMap: Record<string, SeoEntry> = {
  [ROUTES.home]: {
    title: "Central Kastoria Houses | Διαμερίσματα στην Καστοριά για Ενοικίαση",
    description:
      "Discover two apartments for rent in central Kastoria, Greece. Ανακαλύψτε δύο όμορφα διαμερίσματα στο κέντρο της Καστοριάς, κοντά στη λίμνη και στα κύρια σημεία ενδιαφέροντος.",
    keywords: `${commonKeywords}, Central Kastoria Houses, ενοικίαση διαμερίσματος Καστοριά`,
    type: "website",
  },
  [ROUTES.apartments]: {
    title: "Apartments in Kastoria | Διαμερίσματα Central Kastoria Houses",
    description:
      "View both Central Kastoria Houses apartments with photos and details. Δείτε τα διαθέσιμα διαμερίσματα στην Καστοριά και επιλέξτε το ιδανικό για τη διαμονή σας.",
    keywords: `${commonKeywords}, apartment gallery Kastoria, διαμερίσματα Καστοριά`,
  },
  [ROUTES.location]: {
    title: "Location in Kastoria | Τοποθεσία Central Kastoria Houses",
    description:
      "Find Central Kastoria Houses at Papareska 20, Kastoria 52100. Βρείτε εύκολα την τοποθεσία των διαμερισμάτων στην καρδιά της Καστοριάς.",
    keywords: `${commonKeywords}, Papareska 20, location Kastoria, χάρτης Καστοριά`,
  },
  [ROUTES.contact]: {
    title: "Contact Central Kastoria Houses | Επικοινωνία",
    description:
      "Contact us for bookings and availability in Kastoria, Greece. Επικοινωνήστε μαζί μας για κρατήσεις και διαθεσιμότητα στα διαμερίσματα Central Kastoria Houses.",
    keywords: `${commonKeywords}, contact Kastoria apartments, επικοινωνία διαμονή Καστοριά`,
  },
  [ROUTES.houseOne]: {
    title: "Central Kastoria House One | Apartment in Kastoria",
    description:
      "Explore photos of Central Kastoria House One in Kastoria. Δείτε το διαμέρισμα Central Kastoria House One με άνετους χώρους και κεντρική τοποθεσία.",
    keywords: `${commonKeywords}, house one Kastoria, apartment one Kastoria`,
    type: "article",
  },
  [ROUTES.houseTwo]: {
    title: "Central Kastoria House Two | Apartment in Kastoria",
    description:
      "Explore photos of Central Kastoria House Two in Kastoria. Δείτε το διαμέρισμα Central Kastoria House Two με μοντέρνα αισθητική και άνεση.",
    keywords: `${commonKeywords}, house two Kastoria, apartment two Kastoria`,
    type: "article",
  },
  [ROUTES.admin]: {
    title: "Admin | Central Kastoria Houses",
    description: "Private admin area for Central Kastoria Houses.",
    keywords: "admin, private",
    noindex: true,
  },
};

const breadcrumbLabels: Record<string, string> = {
  [ROUTES.home]: "Αρχική | Home",
  [ROUTES.apartments]: "Διαμερίσματα | Apartments",
  [ROUTES.location]: "Τοποθεσία | Location",
  [ROUTES.contact]: "Επικοινωνία | Contact",
  [ROUTES.houseOne]: "Central Kastoria House One",
  [ROUTES.houseTwo]: "Central Kastoria House Two",
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

function canonicalUrlForPath(pathname: string): string {
  const normalizedPath = normalizePath(pathname);
  return normalizedPath === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}`;
}

function upsertMetaByName(name: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute(MANAGED_ATTR, "true");
  element.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute(MANAGED_ATTR, "true");
  element.setAttribute("content", content);
}

function upsertLink(
  rel: string,
  href: string,
  options?: { hreflang?: string },
): void {
  const selector =
    rel === "alternate" && options?.hreflang
      ? `link[rel="${rel}"][hreflang="${options.hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;

  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (options?.hreflang) {
      element.setAttribute("hreflang", options.hreflang);
    }
    document.head.appendChild(element);
  }

  element.setAttribute(MANAGED_ATTR, "true");
  element.setAttribute("href", href);
}

function clearManagedJsonLd(): void {
  document.head
    .querySelectorAll<HTMLScriptElement>(
      `script[type="application/ld+json"][${MANAGED_ATTR}="true"]`,
    )
    .forEach((script) => script.remove());
}

function appendJsonLd(payload: unknown): void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute(MANAGED_ATTR, "true");
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
}

function buildBreadcrumb(pathname: string): Record<string, unknown> | null {
  const normalizedPath = normalizePath(pathname);
  const items: string[] = [];

  if (normalizedPath === ROUTES.houseOne || normalizedPath === ROUTES.houseTwo) {
    items.push(ROUTES.home, ROUTES.apartments, normalizedPath);
  } else if (normalizedPath in breadcrumbLabels) {
    items.push(ROUTES.home, normalizedPath);
  } else {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((path, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumbLabels[path],
      item: canonicalUrlForPath(path),
    })),
  };
}

function getSeoEntry(pathname: string): SeoEntry {
  const normalizedPath = normalizePath(pathname);
  return (
    routeSeoMap[normalizedPath] ?? {
      title: "Central Kastoria Houses",
      description:
        "Apartments in Kastoria, Greece. Διαμερίσματα προς ενοικίαση στην Καστοριά.",
      keywords: commonKeywords,
      noindex: true,
    }
  );
}

export function applyRouteSeo(pathname: string): void {
  const normalizedPath = normalizePath(pathname);
  const seo = getSeoEntry(normalizedPath);
  const canonicalUrl = canonicalUrlForPath(normalizedPath);
  const imageUrl = seo.image ?? DEFAULT_OG_IMAGE;
  const robotsValue = seo.noindex
    ? "noindex, nofollow, noarchive"
    : "index, follow, max-image-preview:large";

  document.title = seo.title;
  document.documentElement.lang = "el";

  upsertMetaByName("description", seo.description);
  upsertMetaByName("keywords", seo.keywords);
  upsertMetaByName("robots", robotsValue);
  upsertMetaByName("googlebot", robotsValue);
  upsertMetaByName("language", "Greek, English");

  upsertMetaByProperty("og:title", seo.title);
  upsertMetaByProperty("og:description", seo.description);
  upsertMetaByProperty("og:type", seo.type ?? "website");
  upsertMetaByProperty("og:url", canonicalUrl);
  upsertMetaByProperty("og:image", imageUrl);
  upsertMetaByProperty("og:site_name", "Central Kastoria Houses");
  upsertMetaByProperty("og:locale", "el_GR");
  upsertMetaByProperty("og:locale:alternate", "en_US");

  upsertMetaByName("twitter:card", "summary_large_image");
  upsertMetaByName("twitter:title", seo.title);
  upsertMetaByName("twitter:description", seo.description);
  upsertMetaByName("twitter:image", imageUrl);

  upsertLink("canonical", canonicalUrl);
  upsertLink("alternate", canonicalUrl, { hreflang: "el" });
  upsertLink("alternate", canonicalUrl, { hreflang: "en" });
  upsertLink("alternate", canonicalUrl, { hreflang: "x-default" });

  clearManagedJsonLd();

  appendJsonLd({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Central Kastoria Houses",
    url: SITE_URL,
    image: [DEFAULT_OG_IMAGE],
    description: seo.description,
    telephone: "+30 6944285792",
    email: "centralkastoriahousetwo@gmail.com",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Papareska 20",
      addressLocality: "Kastoria",
      postalCode: "52100",
      addressCountry: "GR",
    },
    inLanguage: ["el", "en"],
  });

  appendJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    inLanguage: ["el", "en"],
  });

  if (normalizedPath === ROUTES.home) {
    appendJsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Central Kastoria Houses",
      url: SITE_URL,
      inLanguage: ["el", "en"],
    });
  }

  const breadcrumb = buildBreadcrumb(normalizedPath);
  if (breadcrumb) {
    appendJsonLd(breadcrumb);
  }
}
