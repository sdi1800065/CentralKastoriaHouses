import type { ApartmentId } from "./adminGalleryStore";

export const SITE_NAME = "CentralKastoriaHouses";

export const ROUTES = {
  home: "/",
  apartments: "/diamerismata",
  location: "/topo8esia",
  contact: "/epikoinwnia",
  houseOne: "/centralkastoriahouseone",
  houseTwo: "/centralkastoriahousetwo",
  admin: "/admin",
} as const;

export const LOGO_SRC =
  "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=136,fit=crop,q=95/AGB64eZ1E0H835lp/logo-YbNv9KnJOOUPq2BE.png";

// Keep hero path aligned with locally mirrored assets under /public.
export const HERO_IMAGE_SRC =
  "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/AGB64eZ1E0H835lp/20241230-_pou0166-2-dJo5QRr0MDc1Bvn9.jpg";

export const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=Papareska%2020%2C%20Kastoria%2052100&output=embed";

export const copy = {
  navHome: "Αρχική",
  navApartments: "Διαμερίσματα",
  navLocation: "Τοποθεσία",
  navContact: "Επικοινωνία",
  homeHeroTitle: "Καλώς ήρθατε στα Central Kastoria Houses",
  homeHeroText:
    "Ανακαλύψτε δύο όμορφα διαμερίσματα προς ενοικίαση στην καρδιά της Καστοριάς.",
  homeHeroCta: "Εξερευνήστε",
  homeApartmentsTitle: "Τα Διαμερίσματά",
  homeReviewsTitle: "Κριτικές Πελατών",
  homeReviewsSubtitle:
    "Διαβάστε τι λένε οι ικανοποιημένοι επισκέπτες μας για τη διαμονή τους μαζί μας.",
  locationLead:
    "Εξερευνήστε τα δύο όμορφα διαμερίσματα προς ενοικίαση στην καρδιά της Καστοριάς, ιδανικά για την επόμενη διαμονή σας σε αυτή τη γοητευτική πόλη.",
  footerContactTitle: "ΕΠΙΚΟΙΝΩΝΙΑ",
  footerLocationTitle: "ΤΟΠΟΘΕΣΙΑ",
  footerLocationPrimary: "Καστοριά, Ελλάδα",
  footerLocationSecondary: "Κεντρική τοποθεσία κοντά στη λίμνη.",
} as const;

export const routeToTitle: Record<string, string> = {
  [ROUTES.home]:
    "Central Kastoria Houses - Rent Your Dream Apartment | CentralKastoriaHouses",
  [ROUTES.apartments]:
    "Rent Charming Apartments in Central Kastoria Today! | CentralKastoriaHouses",
  [ROUTES.location]:
    "Central Kastoria Houses - Rent Apartments in Kastoria | CentralKastoriaHouses",
  [ROUTES.contact]:
    "Contact Centralkastoriahouses for Apartment Rentals in Kastoria | CentralKastoriaHouses",
  [ROUTES.houseOne]:
    "Discover Central Kastoria Houses | CentralKastoriaHouses",
  [ROUTES.houseTwo]:
    "Explore Central Kastoria House Photo Gallery | CentralKastoriaHouses",
  [ROUTES.admin]: "Admin - CentralKastoriaHouses",
};

export type ApartmentDetails = {
  id: ApartmentId;
  route: string;
  title: string;
  subtitle: string;
  coverImage: string;
  galleryImages: string[];
};

export type HomeReview = {
  id: string;
  stars: 5;
  quote: string;
  author: string;
  city: string;
};

const SQUARE_IMAGE_BASE =
  "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=398,h=398,fit=crop/AGB64eZ1E0H835lp";

const withSquareImage = (fileName: string): string =>
  `${SQUARE_IMAGE_BASE}/${fileName}`;

export const apartments: ApartmentDetails[] = [
  {
    id: "houseOne",
    route: ROUTES.houseOne,
    title: "Central Kastoria House One",
    subtitle:
      "Modern interior, bright spaces, and ideal location in the center of Kastoria.",
    coverImage:
      "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=449,h=445,fit=crop/AGB64eZ1E0H835lp/20250104-_pou0314-YNqPQRVxMlunoeav.jpg",
    galleryImages: [
      "20250104-_pou0314-YNqPQRVxMlunoeav.jpg",
      "20250104-_pou0319-dOq8nR6LX3hPlDqN.jpg",
      "20250102-_pou0281-Yleqgwk1B7H9V1zP.jpg",
      "20250104-_pou0323-Y4LxWR6qpQiMLWkn.jpg",
      "20250104-_pou0337-Yg2q6NkD7eUr4G3N.jpg",
      "20241230-_pou0206-m2WaNR5Pj6HbJqNz.jpg",
      "20250104-_pou0368-AzG3g216OrCnD4Qj.jpg",
      "20250104-_pou0383-YNqPQRVxz6c1n6bJ.jpg",
      "20250104-_pou0409-AwvDgl1zwxFGOR6M.jpg",
      "20250104-_pou0389-YZ9xB10JZWiGvark.jpg",
      "20250104-_pou0428-Yg2q6NkDQwtQLDb1.jpg",
    ].map(withSquareImage),
  },
  {
    id: "houseTwo",
    route: ROUTES.houseTwo,
    title: "Central Kastoria House Two",
    subtitle:
      "Cozy and elegant apartment with warm tones, perfect for couples and families.",
    coverImage:
      "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=431,h=427,fit=crop/AGB64eZ1E0H835lp/20241230-_pou0166-Aq2qg4yQXJFbJ9po.jpg",
    galleryImages: [
      "20241230-_pou0166-Aq2qg4yQXJFbJ9po.jpg",
      "20241230-_pou0194-AR0M8P4zklIkZQql.jpg",
      "20241230-_pou0151-m5KLJRxDD5iX7WZ5.jpg",
      "20241230-_pou0156-ALp7yRwLVxt6Q46V.jpg",
      "20241230-_pou0141-m5KLJRxg9ECjePK8.jpg",
      "20241230-_pou0126-mnlqgQEwKPFWLkNW.jpg",
      "20241230-_pou0121-mk3qgbxaGktpNj5v.jpg",
      "20241230-_pou0111-YNqPQRoG34fpvBMk.jpg",
      "20241230-_pou0094-mePbqzX7oZSe02b5.jpg",
      "20241230-_pou0221-m7V5QRgnXlCo2jKV.jpg",
      "outside-YD0BQRnMOLu5BBa9.jpg",
      "20241019_175247-mk3qgbxO0vuzzGzn.jpg",
    ].map(withSquareImage),
  },
];

export const homeReviews: HomeReview[] = [
  {
    id: "giorgos",
    stars: 5,
    quote:
      "Η διαμονή εδώ ήταν μια φανταστική εμπειρία. Τα διαμερίσματα είναι όμορφα και βρίσκονται σε κεντρική τοποθεσία, διευκολύνοντας την εξερεύνηση της Καστοριάς. Σίγουρα θα επιστρέψω για άλλη μια επίσκεψη!",
    author: "Giorgos Papadopoulos",
    city: "Athens",
  },
  {
    id: "ioannis",
    stars: 5,
    quote:
      "Το διαμέρισμα ήταν τέλειο! Εξαιρετική τοποθεσία και πολύ άνετο. Το προτείνω ανεπιφύλακτα!",
    author: "Ιωάννης Γεωργίου",
    city: "Larissa",
  },
];

export const apartmentById = Object.fromEntries(
  apartments.map((apartment) => [apartment.id, apartment]),
) as Record<ApartmentId, ApartmentDetails>;

export const apartmentByRoute = Object.fromEntries(
  apartments.map((apartment) => [apartment.route, apartment]),
) as Record<string, ApartmentDetails>;

export const mainNav = [
  { to: ROUTES.home, label: copy.navHome },
  { to: ROUTES.apartments, label: copy.navApartments },
  { to: ROUTES.location, label: copy.navLocation },
  { to: ROUTES.contact, label: copy.navContact },
];
