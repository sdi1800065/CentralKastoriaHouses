import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LegacyFrame from "./components/LegacyFrame";
import {
  resolveRouteFromPathname,
  routeToPageTitle,
} from "./legacyRouteMap";
import "./styles.css";

function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>The requested route does not exist in this site.</p>
      <a href="/" className="not-found-link">
        Go to home page
      </a>
    </div>
  );
}

function RoutedLegacyFrame() {
  const location = useLocation();
  const resolvedRoute = resolveRouteFromPathname(location.pathname);

  if (!resolvedRoute) {
    return <NotFound />;
  }

  if (location.pathname !== resolvedRoute) {
    return <Navigate to={resolvedRoute} replace />;
  }

  return (
    <LegacyFrame
      activeRoute={resolvedRoute}
      title={resolvedRoute}
    />
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const resolvedRoute = resolveRouteFromPathname(location.pathname);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.title = resolvedRoute
      ? routeToPageTitle[resolvedRoute]
      : "CentralKastoriaHouses";
  }, [location.pathname, location.hash]);

  return (
    <Routes>
      <Route path="*" element={<RoutedLegacyFrame />} />
    </Routes>
  );
}
