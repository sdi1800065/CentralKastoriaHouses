export const LEGACY_BASE_PATH =
  "/legacy/CentralKastoriaHouses.gr/centralkastoriahouses.gr";

export const routeToLegacyFile = {
  "/": "index.html",
  "/diamerismata": "diamerismata.html",
  "/topo8esia": "topo8esia.html",
  "/epikoinwnia": "epikoinwnia.html",
  "/centralkastoriahouseone": "centralkastoriahouseone.html",
  "/centralkastoriahousetwo": "centralkastoriahousetwo.html",
};

export const legacyFileToRoute = Object.fromEntries(
  Object.entries(routeToLegacyFile).map(([route, file]) => [file, route]),
);

export function normalizePathname(pathname) {
  if (!pathname) {
    return "/";
  }

  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function resolveRouteFromPathname(pathname) {
  const normalizedPath = normalizePathname(pathname);

  if (routeToLegacyFile[normalizedPath]) {
    return normalizedPath;
  }

  if (normalizedPath === "/index.html") {
    return "/";
  }

  const lastSegment = normalizedPath.split("/").filter(Boolean).pop() || "";
  return legacyFileToRoute[lastSegment] || null;
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
};
