"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Container } from "./Container";
import { Icon } from "./Icon";
import { tools } from "@/lib/content";
export function Header() {
  const path = usePathname().replace(/\/+$/, "") || "/";
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <Container className="header-inner">
        <Link href="/" className="brand" aria-label="FretLab, accueil">
          <span className="brand-mark">
            <Icon name="logo" size={25} />
          </span>
          FretLab<span className="brand-dot">.</span>
        </Link>
        <button
          ref={menuButton}
          className="mobile-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Fermer" : "Menu"}
          <Icon name="chevron" size={16} />
        </button>
        <nav
          id="main-nav"
          aria-label="Navigation principale"
          className={open ? "main-nav is-open" : "main-nav"}
        >
          <Link
            href="/"
            aria-current={path === "/" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Accueil
          </Link>
          <details
            className="tools-menu"
            onKeyDown={(e) => {
              if (e.key === "Escape") e.currentTarget.open = false;
            }}
          >
            <summary className={path.startsWith("/outils") ? "active" : ""}>
              Outils <Icon name="chevron" size={14} />
            </summary>
            <div className="tools-dropdown">
              {tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/outils/${tool.slug}`}
                  aria-current={
                    path === `/outils/${tool.slug}` ? "page" : undefined
                  }
                  onClick={(e) => {
                    setOpen(false);
                    const details = e.currentTarget.closest("details");
                    if (details) details.open = false;
                  }}
                >
                  <Icon name={tool.icon} size={18} />
                  {tool.name}
                </Link>
              ))}
            </div>
          </details>
          <Link
            href="/articles"
            aria-current={path === "/articles" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="/a-propos"
            aria-current={path === "/a-propos" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            À propos
          </Link>
        </nav>
        <span className="header-note">
          <span /> Gratuit. Tout simplement.
        </span>
      </Container>
    </header>
  );
}
