import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LOGO_SRC, MAP_EMBED_SRC, ROUTES, copy, mainNav } from "../siteData";

type SiteLayoutProps = {
  children: ReactNode;
};

const navClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? "site-nav__link site-nav__link-active" : "site-nav__link";

export default function SiteLayout({ children }: SiteLayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to={ROUTES.home} className="site-logo-link" aria-label="Home">
            <img src={LOGO_SRC} alt="CentralKastoriaHouses logo" className="site-logo" />
          </Link>

          <button
            type="button"
            className="site-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-nav-toggle__line" />
            <span className="site-nav-toggle__line" />
            <span className="site-nav-toggle__line" />
          </button>

          <nav
            className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
            aria-label="Main"
          >
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={navClassName}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        {menuOpen ? (
          <button
            type="button"
            className="site-nav-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <section className="site-footer__col reveal reveal--delay-1">
            <h3>{copy.footerContactTitle}</h3>
            <p>6944285792</p>
            <p>6946068149</p>
            <p>centralkastoriahousetwo@gmail.com</p>
          </section>

          <section className="site-footer__col reveal reveal--delay-2">
            <h3>{copy.footerLocationTitle}</h3>
            <p>{copy.footerLocationPrimary}</p>
            <p>{copy.footerLocationSecondary}</p>
          </section>

          <section className="site-footer__col site-footer__map-col reveal reveal--delay-3">
            <iframe
              className="site-footer__map"
              title="Central Kastoria location"
              loading="lazy"
              src={MAP_EMBED_SRC}
            />
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026. All rights reserved.</p>
          <Link to={ROUTES.admin} className="site-footer__admin-link">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
