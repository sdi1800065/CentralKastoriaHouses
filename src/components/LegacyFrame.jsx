import { useNavigate } from "react-router-dom";
import {
  LEGACY_BASE_PATH,
  resolveRouteFromPathname,
  routeToLegacyFile,
} from "../legacyRouteMap";

const NON_NAV_HREF = /^(mailto:|tel:|javascript:|#)/i;
const LOGO_FALLBACK_SRC =
  "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=136,fit=crop,q=95/AGB64eZ1E0H835lp/logo-YbNv9KnJOOUPq2BE.png";
const ROUTE_ENTRIES = Object.entries(routeToLegacyFile);
const MOTION_OVERRIDE_STYLE_ID = "legacy-motion-override";
const SCROLL_RESET_DELAYS_MS = [120, 500];
const MOTION_OVERRIDE_CSS = `
.transition.transition--fade:not(.transition--root-hidden)[data-animation-state="active"],
.transition.transition--fade.transition--root-hidden [data-animation-role="image"][data-animation-state="active"].loaded,
.transition.transition--fade.transition--root-hidden [data-animation-role="block-element"][data-animation-state="active"]{
  transition-duration: 1.8s !important;
  transition-delay: 0.02s !important;
  transition-timing-function: ease-out !important;
}

.transition.transition--slide:not(.transition--root-hidden)[data-animation-state="active"],
.transition.transition--slide.transition--root-hidden [data-animation-role="image"][data-animation-state="active"].loaded,
.transition.transition--slide.transition--root-hidden [data-animation-role="block-element"][data-animation-state="active"]{
  transition-duration: 1.8s !important;
  transition-delay: 0.02s !important;
  transition-timing-function: ease-out !important;
}

.transition.transition--scale:not(.transition--root-hidden)[data-animation-state="active"],
.transition.transition--scale.transition--root-hidden [data-animation-role="image"][data-animation-state="active"].loaded,
.transition.transition--scale.transition--root-hidden [data-animation-role="block-element"][data-animation-state="active"]{
  transition-duration: 1.8s !important;
  transition-delay: 0.02s !important;
  transition-timing-function: ease-out !important;
}
`;

function mapHrefToRoute(href, baseHref) {
  if (!href || NON_NAV_HREF.test(href)) {
    return null;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(href, baseHref);
  } catch {
    return null;
  }

  if (parsedUrl.origin !== window.location.origin) {
    return null;
  }

  const route = resolveRouteFromPathname(parsedUrl.pathname);
  const suffix = `${parsedUrl.search}${parsedUrl.hash}`;
  return route ? `${route}${suffix}` : null;
}

export default function LegacyFrame({ activeRoute, title }) {
  const navigate = useNavigate();

  const resetScrollPosition = (frameEl) => {
    const frameWindow = frameEl.contentWindow;
    const doc = frameEl.contentDocument;

    if (!frameWindow || !doc) {
      return;
    }

    frameWindow.scrollTo(0, 0);
    doc.documentElement.scrollTop = 0;
    doc.body.scrollTop = 0;
  };

  const patchLogo = (doc) => {
    const logoImages = doc.querySelectorAll(
      "img.block-header-logo__image, img[alt*='logo' i]",
    );
    for (const image of logoImages) {
      if (image.dataset.logoFixed === "true") {
        continue;
      }

      image.dataset.logoFixed = "true";
      image.setAttribute("src", LOGO_FALLBACK_SRC);
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
    }
  };

  const patchAnchors = (doc) => {
    const anchors = doc.querySelectorAll("a[href]");
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href");
      const mappedHref = mapHrefToRoute(href, doc.baseURI);
      if (!mappedHref) {
        continue;
      }

      anchor.setAttribute("href", mappedHref);
      anchor.setAttribute("target", "_top");
      anchor.setAttribute("rel", "noopener");
    }
  };

  const applyMotionOverride = (doc) => {
    if (!doc.head || doc.getElementById(MOTION_OVERRIDE_STYLE_ID)) {
      return;
    }

    const style = doc.createElement("style");
    style.id = MOTION_OVERRIDE_STYLE_ID;
    style.textContent = MOTION_OVERRIDE_CSS;
    doc.head.appendChild(style);
  };

  const applyDocumentPatches = (doc) => {
    patchLogo(doc);
    patchAnchors(doc);
    applyMotionOverride(doc);
  };

  const addNavigationDelegate = (doc) => {
    if (doc.documentElement.dataset.navDelegateAttached === "true") {
      return;
    }

    doc.documentElement.dataset.navDelegateAttached = "true";
    doc.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      const mappedHref = mapHrefToRoute(href, doc.baseURI);
      if (!mappedHref) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      navigate(mappedHref);
    }, true);
  };

  const handleLoad = (event) => {
    const frameEl = event.currentTarget;
    const doc = frameEl.contentDocument;
    if (!doc) {
      return;
    }

    applyDocumentPatches(doc);
    addNavigationDelegate(doc);

    resetScrollPosition(frameEl);
    for (const delayMs of SCROLL_RESET_DELAYS_MS) {
      setTimeout(() => resetScrollPosition(frameEl), delayMs);
    }

    const observer = new MutationObserver(() => {
      applyDocumentPatches(doc);
    });
    observer.observe(doc.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 4000);
  };

  return (
    <div className="legacy-frame-wrap">
      {ROUTE_ENTRIES.map(([route, mappedFileName]) => (
        <iframe
          key={route}
          className={
            route === activeRoute
              ? "legacy-frame legacy-frame-active"
              : "legacy-frame legacy-frame-hidden"
          }
          src={`${LEGACY_BASE_PATH}/${mappedFileName}`}
          title={title || route}
          onLoad={handleLoad}
          aria-hidden={route !== activeRoute}
        />
      ))}
    </div>
  );
}
