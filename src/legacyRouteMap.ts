export const LEGACY_BASE_PATH =
  "/legacy/CentralKastoriaHouses.gr/centralkastoriahouses.gr";

export const routeToLegacyFile = {
  "/": "index.html",
  "/diamerismata": "diamerismata.html",
  "/topo8esia": "topo8esia.html",
  "/epikoinwnia": "epikoinwnia.html",
  "/centralkastoriahouseone": "centralkastoriahouseone.html",
  "/centralkastoriahousetwo": "centralkastoriahousetwo.html",
} as const;

export type LegacyRoute = keyof typeof routeToLegacyFile;
export type LegacyHtmlFile = (typeof routeToLegacyFile)[LegacyRoute];

export const legacyRoutes = Object.keys(routeToLegacyFile) as LegacyRoute[];

export const legacyFileToRoute = Object.fromEntries(
  Object.entries(routeToLegacyFile).map(([route, file]) => [file, route]),
) as Record<LegacyHtmlFile, LegacyRoute>;

export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function resolveRouteFromPathname(
  pathname: string,
): LegacyRoute | null {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath in routeToLegacyFile) {
    return normalizedPath as LegacyRoute;
  }

  if (normalizedPath === "/index.html") {
    return "/";
  }

  const lastSegment = normalizedPath.split("/").filter(Boolean).pop() || "";
  return (legacyFileToRoute as Record<string, LegacyRoute | undefined>)[
    lastSegment
  ] || null;
}

export const routeToPageTitle = {
  "/": "Central Kastoria Houses - Rent Your Dream Apartment | CentralKastoriaHouses",
  "/diamerismata":
    "Rent Charming Apartments in Central Kastoria Today! | CentralKastoriaHouses",
  "/topo8esia":
    "Central Kastoria Houses - Rent Apartments in Kastoria | CentralKastoriaHouses",
  "/epikoinwnia":
    "Contact Centralkastoriahouses for Apartment Rentals in Kastoria | CentralKastoriaHouses",
  "/centralkastoriahouseone":
    "Discover Central Kastoria Houses | CentralKastoriaHouses",
  "/centralkastoriahousetwo":
    "Explore Central Kastoria House Photo Gallery | CentralKastoriaHouses",
} as const satisfies Record<LegacyRoute, string>;
