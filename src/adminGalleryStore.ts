import { apartments } from "./siteData";

export type ApartmentId = "houseOne" | "houseTwo";

export type AdminImageStore = Record<ApartmentId, string[]>;

export const ADMIN_IMAGES_STORAGE_KEY = "ckh-admin-images-v2";
const LEGACY_ADMIN_IMAGES_STORAGE_KEY = "ckh-admin-images-v1";
export const ADMIN_IMAGES_UPDATED_EVENT = "ckh-admin-images-updated";

const defaultStoreFromApartments = (): AdminImageStore => ({
  houseOne: apartments.find((apartment) => apartment.id === "houseOne")?.galleryImages ?? [],
  houseTwo: apartments.find((apartment) => apartment.id === "houseTwo")?.galleryImages ?? [],
});

export const DEFAULT_ADMIN_IMAGE_STORE: AdminImageStore = defaultStoreFromApartments();

export const apartmentLabels: Record<ApartmentId, string> = {
  houseOne: "Central Kastoria House One",
  houseTwo: "Central Kastoria House Two",
};

export const apartmentOptions = Object.entries(apartmentLabels).map(
  ([value, label]) => ({
    value: value as ApartmentId,
    label,
  }),
);

function isDataImage(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isManagedImage(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return (
    value.startsWith("data:image/") ||
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function normalizeManagedImagePath(value: string): string {
  if (value.startsWith("data:image/")) {
    return value;
  }

  if (value.startsWith("https://assets.zyrosite.com/")) {
    return value.replace(
      "https://assets.zyrosite.com/cdn-cgi/image/",
      "/assets/cdn-cgi/image/",
    );
  }

  if (value.startsWith("http://assets.zyrosite.com/")) {
    return value.replace(
      "http://assets.zyrosite.com/cdn-cgi/image/",
      "/assets/cdn-cgi/image/",
    );
  }

  if (value.startsWith("/assets.zyrosite.com/")) {
    return value.replace(
      "/assets.zyrosite.com/cdn-cgi/image/",
      "/assets/cdn-cgi/image/",
    );
  }

  return value;
}

function normalizeStore(
  candidate: unknown,
  allowOnlyDataImages = false,
): AdminImageStore {
  const defaultStore = defaultStoreFromApartments();

  if (!candidate || typeof candidate !== "object") {
    return defaultStore;
  }

  const maybeStore = candidate as Partial<Record<ApartmentId, unknown>>;
  const normalizeImages = (images: unknown): string[] => {
    if (!Array.isArray(images)) {
      return [];
    }

    const validImages = images.filter(
      allowOnlyDataImages ? isDataImage : isManagedImage,
    ) as string[];

    if (allowOnlyDataImages) {
      return validImages;
    }

    return validImages.map(normalizeManagedImagePath);
  };

  return {
    houseOne: normalizeImages(maybeStore.houseOne),
    houseTwo: normalizeImages(maybeStore.houseTwo),
  };
}

function mergeDefaultWithLegacyExtras(
  defaultStore: AdminImageStore,
  legacyStore: AdminImageStore,
): AdminImageStore {
  const mergeApartment = (apartmentId: ApartmentId): string[] => {
    const baseImages = defaultStore[apartmentId];
    const legacyExtras = legacyStore[apartmentId].filter(
      (image) => !baseImages.includes(image),
    );
    return [...baseImages, ...legacyExtras];
  };

  return {
    houseOne: mergeApartment("houseOne"),
    houseTwo: mergeApartment("houseTwo"),
  };
}

export function readAdminImageStore(): AdminImageStore {
  const defaultStore = defaultStoreFromApartments();

  if (typeof window === "undefined") {
    return defaultStore;
  }

  try {
    const rawValue = window.localStorage.getItem(ADMIN_IMAGES_STORAGE_KEY);
    if (rawValue) {
      const parsed = JSON.parse(rawValue) as unknown;
      return normalizeStore(parsed);
    }

    const legacyValue = window.localStorage.getItem(LEGACY_ADMIN_IMAGES_STORAGE_KEY);
    if (legacyValue) {
      const parsedLegacy = JSON.parse(legacyValue) as unknown;
      const legacyExtras = normalizeStore(parsedLegacy, true);
      const migratedStore = mergeDefaultWithLegacyExtras(defaultStore, legacyExtras);
      writeAdminImageStore(migratedStore);
      return migratedStore;
    }
  } catch {
    return defaultStore;
  }

  return defaultStore;
}

export function writeAdminImageStore(nextStore: AdminImageStore): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_IMAGES_STORAGE_KEY,
    JSON.stringify(nextStore),
  );

  window.dispatchEvent(new Event(ADMIN_IMAGES_UPDATED_EVENT));
}

export function cloneAdminImageStore(store: AdminImageStore): AdminImageStore {
  return {
    houseOne: [...store.houseOne],
    houseTwo: [...store.houseTwo],
  };
}
