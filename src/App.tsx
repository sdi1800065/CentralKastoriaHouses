import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  ApartmentPage,
  ApartmentsPage,
  ContactPage,
  HomePage,
  LocationPage,
  NotFoundPage,
} from "./components/SitePages";
import AdminGalleryPage from "./components/AdminGalleryPage";
import { ROUTES } from "./siteData";
import { applyRouteSeo } from "./seo";
import "./styles.css";

const legacyPathRedirects: Record<string, string> = {
  "/index.html": ROUTES.home,
  "/diamerismata.html": ROUTES.apartments,
  "/topo8esia.html": ROUTES.location,
  "/epikoinwnia.html": ROUTES.contact,
  "/centralkastoriahouseone.html": ROUTES.houseOne,
  "/centralkastoriahousetwo.html": ROUTES.houseTwo,
};

function ScrollAndTitleController() {
  const location = useLocation();

  useEffect(() => {
    const normalizedPath =
      location.pathname.length > 1
        ? location.pathname.replace(/\/+$/, "")
        : location.pathname;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    applyRouteSeo(normalizedPath);
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollAndTitleController />
      <Routes>
        {Object.entries(legacyPathRedirects).map(([fromPath, toPath]) => (
          <Route
            key={fromPath}
            path={fromPath}
            element={<Navigate to={toPath} replace />}
          />
        ))}
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.apartments} element={<ApartmentsPage />} />
        <Route path={ROUTES.location} element={<LocationPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route
          path={ROUTES.houseOne}
          element={<ApartmentPage apartmentId="houseOne" />}
        />
        <Route
          path={ROUTES.houseTwo}
          element={<ApartmentPage apartmentId="houseTwo" />}
        />
        <Route path={ROUTES.admin} element={<AdminGalleryPage />} />
        <Route path={`${ROUTES.admin}/*`} element={<AdminGalleryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
