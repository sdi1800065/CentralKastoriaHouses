import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { LegacyRoute } from "../legacyRouteMap";
import {
  LEGACY_BASE_PATH,
  legacyRoutes,
  resolveRouteFromPathname,
  routeToLegacyFile,
} from "../legacyRouteMap";

type LegacyFrameProps = {
  activeRoute: LegacyRoute;
  title?: string;
};

const NON_NAV_HREF = /^(mailto:|tel:|javascript:|#)/i;
const LOGO_FALLBACK_SRC =
  "/assets.zyrosite.com/cdn-cgi/image/format=auto,w=136,fit=crop,q=95/AGB64eZ1E0H835lp/logo-YbNv9KnJOOUPq2BE.png";
const ROUTE_ENTRIES = legacyRoutes.map(
  (route) => [route, routeToLegacyFile[route]] as const,
);
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

function mapHrefToRoute(href: string | null, baseHref: string): string | null {
  if (!href || NON_NAV_HREF.test(href)) {
    return null;
  }

  let parsedUrl: URL;
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

function resetScrollPosition(frameEl: HTMLIFrameElement): void {
  const frameWindow = frameEl.contentWindow;
  const doc = frameEl.contentDocument;

  if (!frameWindow || !doc) {
    return;
  }

  frameWindow.scrollTo(0, 0);
  doc.documentElement.scrollTop = 0;
  doc.body.scrollTop = 0;
}

function patchLogo(doc: Document): void {
  const logoImages = doc.querySelectorAll<HTMLImageElement>(
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
}

function patchAnchors(doc: Document): void {
  const anchors = doc.querySelectorAll<HTMLAnchorElement>("a[href]");
  for (const anchor of anchors) {
    const mappedHref = mapHrefToRoute(anchor.getAttribute("href"), doc.baseURI);
    if (!mappedHref) {
      continue;
    }

    anchor.setAttribute("href", mappedHref);
    anchor.setAttribute("target", "_top");
    anchor.setAttribute("rel", "noopener");
  }
}

function applyMotionOverride(doc: Document): void {
  if (!doc.head || doc.getElementById(MOTION_OVERRIDE_STYLE_ID)) {
    return;
  }

  const style = doc.createElement("style");
  style.id = MOTION_OVERRIDE_STYLE_ID;
  style.textContent = MOTION_OVERRIDE_CSS;
  doc.head.appendChild(style);
}

function applyDocumentPatches(doc: Document): void {
  patchLogo(doc);
  patchAnchors(doc);
  applyMotionOverride(doc);
}

export default function LegacyFrame({ activeRoute, title }: LegacyFrameProps) {
  const navigate = useNavigate();

  const addNavigationDelegate = (doc: Document): void => {
    const docEl = doc.documentElement;
    if (docEl.dataset.navDelegateAttached === "true") {
      return;
    }

    docEl.dataset.navDelegateAttached = "true";
    doc.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element | null;
        const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
        if (!anchor) {
          return;
        }

        const mappedHref = mapHrefToRoute(anchor.getAttribute("href"), doc.baseURI);
        if (!mappedHref) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        navigate(mappedHref);
      },
      true,
    );
  };

  const handleLoad = (event: SyntheticEvent<HTMLIFrameElement>): void => {
    const frameEl = event.currentTarget as HTMLIFrameElement;
    const doc = frameEl.contentDocument;
    if (!doc) {
      return;
    }

    applyDocumentPatches(doc);
    addNavigationDelegate(doc);

    resetScrollPosition(frameEl);
    for (const delayMs of SCROLL_RESET_DELAYS_MS) {
      window.setTimeout(() => resetScrollPosition(frameEl), delayMs);
    }

    const observer = new MutationObserver(() => {
      applyDocumentPatches(doc);
    });
    observer.observe(doc.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 4000);
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
