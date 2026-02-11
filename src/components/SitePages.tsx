import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ADMIN_IMAGES_UPDATED_EVENT,
  readAdminImageStore,
  type AdminImageStore,
  type ApartmentId,
} from "../adminGalleryStore";
import {
  HERO_IMAGE_SRC,
  MAP_EMBED_SRC,
  apartmentById,
  apartments,
  copy,
  homeReviews,
  type ApartmentDetails,
  type HomeReview,
} from "../siteData";
import SiteLayout from "./SiteLayout";

function useAdminImages(): AdminImageStore {
  const [store, setStore] = useState<AdminImageStore>(() => readAdminImageStore());

  useEffect(() => {
    const refreshStore = (): void => {
      setStore(readAdminImageStore());
    };

    window.addEventListener("storage", refreshStore);
    window.addEventListener(ADMIN_IMAGES_UPDATED_EVENT, refreshStore);

    return () => {
      window.removeEventListener("storage", refreshStore);
      window.removeEventListener(ADMIN_IMAGES_UPDATED_EVENT, refreshStore);
    };
  }, []);

  return store;
}

function apartmentCover(apartment: ApartmentDetails, store: AdminImageStore): string {
  return store[apartment.id][0] || apartment.coverImage;
}

function apartmentGallery(
  apartment: ApartmentDetails,
  store: AdminImageStore,
): string[] {
  return store[apartment.id].length ? store[apartment.id] : apartment.galleryImages;
}

const HIGH_RES_IMAGE_BASE =
  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920/AGB64eZ1E0H835lp";

function toLightboxImageSrc(imageSrc: string): string {
  if (imageSrc.startsWith("data:")) {
    return imageSrc;
  }

  const match = imageSrc.match(/\/AGB64eZ1E0H835lp\/([^/?#]+)/);
  if (!match) {
    return imageSrc;
  }

  return `${HIGH_RES_IMAGE_BASE}/${match[1]}`;
}

function revealDelayClass(index: number): string {
  return `reveal--delay-${(index % 4) + 1}`;
}

type ApartmentCardProps = {
  apartment: ApartmentDetails;
  coverImage: string;
  revealClass?: string;
};

function ApartmentCard({
  apartment,
  coverImage,
  revealClass = "",
}: ApartmentCardProps) {
  return (
    <article className={`apartment-card reveal ${revealClass}`.trim()}>
      <h5 className="apartment-card__title">{apartment.title}</h5>
      <Link to={apartment.route} className="apartment-card__image-link">
        <img src={coverImage} alt={apartment.title} className="apartment-card__image" />
      </Link>
    </article>
  );
}

type GalleryGridProps = {
  apartmentId: ApartmentId;
  images: string[];
  onImageClick?: (index: number) => void;
};

function GalleryGrid({ apartmentId, images, onImageClick }: GalleryGridProps) {
  return (
    <section className="gallery-grid" aria-label={`${apartmentId} image gallery`}>
      {images.map((imageSrc, index) => (
        <figure
          key={`${apartmentId}-${index}-${imageSrc}`}
          className={`gallery-grid__item reveal ${revealDelayClass(index)}`}
        >
          <button
            type="button"
            className="gallery-grid__open"
            onClick={() => onImageClick?.(index)}
            aria-label={`Open ${apartmentById[apartmentId].title} image ${index + 1}`}
          >
            <img
              src={imageSrc}
              alt={`${apartmentById[apartmentId].title} ${index + 1}`}
              className="gallery-grid__image"
              loading={index < 6 ? "eager" : "lazy"}
            />
          </button>
        </figure>
      ))}
    </section>
  );
}

type ImageLightboxProps = {
  apartmentTitle: string;
  images: string[];
  activeIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function ImageLightbox({
  apartmentTitle,
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
}: ImageLightboxProps) {
  const activeImageSrc = toLightboxImageSrc(images[activeIndex]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${apartmentTitle} gallery viewer`}>
      <button
        type="button"
        className="lightbox__backdrop"
        aria-label="Close image viewer"
        onClick={onClose}
      />

      <div className="lightbox__dialog">
        <button
          type="button"
          className="lightbox__control lightbox__control--close"
          aria-label="Close image viewer"
          onClick={onClose}
        >
          {"\u00D7"}
        </button>
        <button
          type="button"
          className="lightbox__control lightbox__control--prev"
          aria-label="Previous image"
          onClick={onPrevious}
        >
          {"\u2039"}
        </button>

        <figure className="lightbox__figure">
          <img
            src={activeImageSrc}
            alt={`${apartmentTitle} ${activeIndex + 1}`}
            className="lightbox__image"
          />
          <figcaption className="lightbox__caption">
            {activeIndex + 1} / {images.length}
          </figcaption>
        </figure>

        <button
          type="button"
          className="lightbox__control lightbox__control--next"
          aria-label="Next image"
          onClick={onNext}
        >
          {"\u203A"}
        </button>
      </div>
    </div>
  );
}

type ReviewCardProps = {
  review: HomeReview;
  revealClass: string;
};

function ReviewCard({ review, revealClass }: ReviewCardProps) {
  const initials = review.author
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className={`review-card reveal ${revealClass}`.trim()}>
      <div className="review-card__stars" aria-label={`${review.stars} star rating`}>
        {"\u2605".repeat(review.stars)}
      </div>
      <p className="review-card__quote">{review.quote}</p>
      <div className="review-card__meta">
        <span className="review-card__avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="review-card__author-wrap">
          <p className="review-card__author">{review.author}</p>
          <p className="review-card__city">{review.city}</p>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const store = useAdminImages();
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) {
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 920px)");
    if (reducedMotionQuery.matches || mobileQuery.matches) {
      return;
    }

    let rafId: number | null = null;

    const updateParallax = (): void => {
      rafId = null;

      const rect = heroElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;
      if (rect.bottom <= 0 || rect.top >= viewportHeight) {
        return;
      }

      const scrolledInsideHero = Math.max(0, -rect.top);
      const parallaxOffset = Math.min(scrolledInsideHero * 0.38, 180);
      heroElement.style.setProperty("--hero-scroll-offset", `${parallaxOffset}px`);
    };

    const handleScroll = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      heroElement.style.removeProperty("--hero-scroll-offset");
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <SiteLayout>
      <section ref={heroRef} className="hero hero--parallax reveal reveal--slow">
        <img src={HERO_IMAGE_SRC} alt="Central Kastoria Houses exterior" className="hero__image" />
        <div className="hero__overlay">
          <h1 className="reveal reveal--delay-1">{copy.homeHeroTitle}</h1>
          <p className="reveal reveal--delay-2">{copy.homeHeroText}</p>
          <Link to="/diamerismata" className="button hero__cta reveal reveal--delay-3">
            {copy.homeHeroCta}
          </Link>
        </div>
      </section>

      <section className="section home-apartments">
        <div className="section__header reveal reveal--delay-1">
          <h3>{copy.homeApartmentsTitle}</h3>
        </div>
        <div className="apartment-grid apartment-grid--home">
          {apartments.map((apartment, index) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              coverImage={apartmentCover(apartment, store)}
              revealClass={revealDelayClass(index + 1)}
            />
          ))}
        </div>
      </section>

      <section className="section home-reviews">
        <div className="section__header reveal reveal--delay-1">
          <h3>{copy.homeReviewsTitle}</h3>
          <p>{copy.homeReviewsSubtitle}</p>
        </div>
        <div className="review-grid">
          {homeReviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              revealClass={revealDelayClass(index + 1)}
            />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

export function ApartmentsPage() {
  const store = useAdminImages();

  return (
    <SiteLayout>
      <section className="section section-first apartments-list">
        <div className="section__header reveal reveal--delay-1">
          <h3>Central Kastoria Houses</h3>
        </div>
        <div className="apartment-grid apartment-grid--apartments">
          {apartments.map((apartment, index) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              coverImage={apartmentCover(apartment, store)}
              revealClass={revealDelayClass(index + 1)}
            />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

type ApartmentPageProps = {
  apartmentId: ApartmentId;
};

export function ApartmentPage({ apartmentId }: ApartmentPageProps) {
  const store = useAdminImages();
  const apartment = apartmentById[apartmentId];
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const images = useMemo(
    () => apartmentGallery(apartment, store),
    [apartment, store],
  );

  useEffect(() => {
    if (activeImageIndex === null || images.length === 0) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setActiveImageIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) =>
          current === null ? 0 : (current + 1) % images.length,
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) =>
          current === null ? 0 : (current - 1 + images.length) % images.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, images.length]);

  return (
    <SiteLayout>
      <section className="section section-first">
        <div className="section__header reveal reveal--delay-1">
          <h3>{apartment.title}</h3>
        </div>
        <GalleryGrid
          apartmentId={apartmentId}
          images={images}
          onImageClick={(index) => setActiveImageIndex(index)}
        />
      </section>

      {activeImageIndex !== null && images.length > 0 ? (
        <ImageLightbox
          apartmentTitle={apartment.title}
          images={images}
          activeIndex={activeImageIndex}
          onClose={() => setActiveImageIndex(null)}
          onPrevious={() =>
            setActiveImageIndex((index) =>
              index === null ? 0 : (index - 1 + images.length) % images.length,
            )
          }
          onNext={() =>
            setActiveImageIndex((index) =>
              index === null ? 0 : (index + 1) % images.length,
            )
          }
        />
      ) : null}
    </SiteLayout>
  );
}

export function LocationPage() {
  return (
    <SiteLayout>
      <section className="section section-first location-page">
        <div className="location-page__grid">
          <div className="location-page__text reveal reveal--delay-1">
            <h3>Central Kastoria Houses</h3>
            <p>{copy.locationLead}</p>
            <h4>Location</h4>
            <p>Papareska 20 Kastoria</p>
            <h4>Hours</h4>
            <p>2 PM - 10 PM</p>
          </div>
          <iframe
            title="Kastoria map"
            className="location-page__map reveal reveal--delay-2"
            loading="lazy"
            src={MAP_EMBED_SRC}
          />
        </div>
      </section>
    </SiteLayout>
  );
}

export function ContactPage() {
  return (
    <SiteLayout>
      <section className="section section-first contact-page">
        <div className="contact-page__center reveal reveal--delay-1">
          <h3>Get in Touch</h3>
          <h4>Contact us to book your stay</h4>
          <p className="contact-page__phones">
            6944285792
            <br />
            6946068149
          </p>
          <p className="contact-page__email">centralkastoriahousetwo@gmail.com</p>
        </div>
      </section>
    </SiteLayout>
  );
}

export function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>The requested route does not exist in this site.</p>
      <Link to="/" className="not-found-link">
        Go to home page
      </Link>
    </div>
  );
}
