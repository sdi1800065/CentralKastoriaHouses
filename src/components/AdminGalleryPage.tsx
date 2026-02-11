import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  apartmentLabels,
  apartmentOptions,
  cloneAdminImageStore,
  readAdminImageStore,
  type ApartmentId,
  type AdminImageStore,
  writeAdminImageStore,
} from "../adminGalleryStore";
import {
  endAdminSession,
  isAdminSessionValid,
  startAdminSession,
  verifyAdminPassword,
} from "../adminAuth";

const MAX_IMAGES_PER_APARTMENT = 32;
const MAX_IMAGE_EDGE_PX = 1920;
const JPEG_QUALITY = 0.88;

function toCanvasDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onerror = () => reject(new Error("Could not read file."));

    fileReader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Could not parse image."));
      image.onload = () => {
        const maxEdge = Math.max(image.width, image.height);
        const scale = maxEdge > MAX_IMAGE_EDGE_PX ? MAX_IMAGE_EDGE_PX / maxEdge : 1;
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }

        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      image.src = String(fileReader.result);
    };

    fileReader.readAsDataURL(file);
  });
}

function persistStore(
  nextStore: AdminImageStore,
  onSuccess: (nextStore: AdminImageStore) => void,
  onError: (message: string) => void,
): void {
  try {
    writeAdminImageStore(nextStore);
    onSuccess(nextStore);
  } catch {
    onError(
      "Could not save images. Browser storage may be full. Remove some images and try again.",
    );
  }
}

function AdminLoginGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (lockedUntil <= Date.now()) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [lockedUntil]);

  const isLocked = now < lockedUntil;
  const lockRemainingSeconds = Math.max(
    0,
    Math.ceil((lockedUntil - now) / 1000),
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting || isLocked) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const valid = await verifyAdminPassword(password);

      if (valid) {
        startAdminSession();
        setPassword("");
        onAuthenticated();
        return;
      }

      const nextAttempts = failedAttempts + 1;
      const lockMs = Math.min(12000, 2000 * nextAttempts);
      setFailedAttempts(nextAttempts);
      setLockedUntil(Date.now() + lockMs);
      setErrorMessage("Invalid password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-page__panel admin-page__auth-panel">
        <header className="admin-page__header">
          <h1>Admin Access</h1>
          <p>Enter your password to manage apartment galleries.</p>
          <div className="admin-page__links">
            <Link to="/" className="admin-page__link admin-page__link-muted">
              Back to home
            </Link>
          </div>
        </header>

        <form className="admin-page__controls" onSubmit={handleSubmit}>
          <label className="admin-page__label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="admin-page__file-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting || isLocked}
          />

          <div className="admin-page__actions">
            <button
              type="submit"
              className="admin-page__button"
              disabled={isSubmitting || isLocked || !password.trim()}
            >
              {isSubmitting ? "Checking..." : "Open admin"}
            </button>
          </div>

          {isLocked ? (
            <p className="admin-page__hint">
              Too many attempts. Try again in {lockRemainingSeconds}s.
            </p>
          ) : null}
          {errorMessage ? <p className="admin-page__error">{errorMessage}</p> : null}
        </form>
      </div>
    </main>
  );
}

export default function AdminGalleryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminSessionValid());
  const [selectedApartment, setSelectedApartment] = useState<ApartmentId>(
    apartmentOptions[0].value,
  );
  const [store, setStore] = useState<AdminImageStore>(() => readAdminImageStore());
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [insertAtStart, setInsertAtStart] = useState(false);

  const selectedImages = useMemo(
    () => store[selectedApartment],
    [selectedApartment, store],
  );

  if (!isAuthenticated) {
    return <AdminLoginGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const handleApartmentChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedApartment(event.target.value as ApartmentId);
    setStatusMessage("");
    setErrorMessage("");
  };

  const handleFileSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const currentImages = store[selectedApartment];
      const remainingSlots = MAX_IMAGES_PER_APARTMENT - currentImages.length;

      if (remainingSlots <= 0) {
        setErrorMessage(
          `Maximum ${MAX_IMAGES_PER_APARTMENT} images reached for ${apartmentLabels[selectedApartment]}.`,
        );
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const processedImages: string[] = [];

      for (const file of filesToProcess) {
        processedImages.push(await toCanvasDataUrl(file));
      }

      const nextStore = cloneAdminImageStore(store);
      nextStore[selectedApartment] = insertAtStart
        ? [...processedImages, ...nextStore[selectedApartment]]
        : [...nextStore[selectedApartment], ...processedImages];

      persistStore(
        nextStore,
        (savedStore) => {
          setStore(savedStore);
          const skippedCount = files.length - filesToProcess.length;
          setStatusMessage(
            skippedCount > 0
              ? `Added ${processedImages.length} image(s). ${skippedCount} file(s) were skipped due to the per-apartment limit.`
              : `Added ${processedImages.length} image(s) to ${apartmentLabels[selectedApartment]}.`,
          );
        },
        setErrorMessage,
      );
    } catch {
      setErrorMessage(
        "One or more selected files could not be processed. Try different images.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (index: number): void => {
    const nextStore = cloneAdminImageStore(store);
    nextStore[selectedApartment] = nextStore[selectedApartment].filter(
      (_, imageIndex) => imageIndex !== index,
    );

    persistStore(
      nextStore,
      (savedStore) => {
        setStore(savedStore);
        setStatusMessage("Image removed.");
        setErrorMessage("");
      },
      setErrorMessage,
    );
  };

  const handleClearApartment = (): void => {
    const nextStore = cloneAdminImageStore(store);
    nextStore[selectedApartment] = [];

    persistStore(
      nextStore,
      (savedStore) => {
        setStore(savedStore);
        setStatusMessage(`${apartmentLabels[selectedApartment]} images cleared.`);
        setErrorMessage("");
      },
      setErrorMessage,
    );
  };

  const handleClearAll = (): void => {
    const nextStore: AdminImageStore = {
      houseOne: [],
      houseTwo: [],
    };

    persistStore(
      nextStore,
      (savedStore) => {
        setStore(savedStore);
        setStatusMessage("All apartment galleries cleared.");
        setErrorMessage("");
      },
      setErrorMessage,
    );
  };

  const handleLogout = (): void => {
    endAdminSession();
    setIsAuthenticated(false);
  };

  return (
    <main className="admin-page">
      <div className="admin-page__panel">
        <header className="admin-page__header">
          <h1>Apartment Images Admin</h1>
          <p>
            Manage the full gallery for each apartment. You can insert new
            images and delete any existing image.
          </p>
          <div className="admin-page__links">
            <Link to="/diamerismata" className="admin-page__link">
              Open apartments page
            </Link>
            <Link to="/" className="admin-page__link admin-page__link-muted">
              Back to home
            </Link>
            <button
              type="button"
              className="admin-page__link admin-page__link-muted"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="admin-page__controls" aria-label="Upload controls">
          <label className="admin-page__label" htmlFor="apartment-select">
            Select apartment
          </label>
          <select
            id="apartment-select"
            className="admin-page__select"
            value={selectedApartment}
            onChange={handleApartmentChange}
          >
            {apartmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="admin-page__label" htmlFor="image-upload">
            Insert new pictures
          </label>
          <input
            id="image-upload"
            className="admin-page__file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelection}
            disabled={isProcessing}
          />

          <label className="admin-page__checkbox">
            <input
              type="checkbox"
              checked={insertAtStart}
              onChange={(event) => setInsertAtStart(event.target.checked)}
              disabled={isProcessing}
            />
            <span>Insert at beginning of gallery</span>
          </label>

          <div className="admin-page__actions">
            <button
              type="button"
              className="admin-page__button"
              onClick={handleClearApartment}
              disabled={isProcessing || selectedImages.length === 0}
            >
              Clear selected apartment
            </button>
            <button
              type="button"
              className="admin-page__button admin-page__button-danger"
              onClick={handleClearAll}
              disabled={isProcessing}
            >
              Clear all apartments
            </button>
          </div>

          <p className="admin-page__hint">
            Stored images for {apartmentLabels[selectedApartment]}:{" "}
            {selectedImages.length}/{MAX_IMAGES_PER_APARTMENT}
          </p>

          {statusMessage ? (
            <p className="admin-page__status">{statusMessage}</p>
          ) : null}
          {errorMessage ? <p className="admin-page__error">{errorMessage}</p> : null}
        </section>

        <section className="admin-page__gallery" aria-label="Stored images">
          {selectedImages.length ? (
            selectedImages.map((imageSrc, index) => (
              <article key={`${selectedApartment}-${index}`} className="admin-image-card">
                <img
                  src={imageSrc}
                  alt={`${apartmentLabels[selectedApartment]} uploaded ${index + 1}`}
                  className="admin-image-card__image"
                />
                <button
                  type="button"
                  className="admin-image-card__remove"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </button>
              </article>
            ))
          ) : (
            <p className="admin-page__empty">
              No images are currently stored for this apartment.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
