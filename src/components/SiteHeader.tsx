import { useState } from "react";

const navItems = ["How it works", "Report", "Security", "Roadmap"];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-top-row">
        <a className="brand" href="#top" aria-label="SimpleTerms home">
          <span className="brand-mark" aria-hidden="true">
            ST
          </span>
          <span>SimpleTerms</span>
        </a>

        <button
          className={`menu-toggle ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      <nav className={`nav-links ${isOpen ? "open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
            onClick={() => setIsOpen(false)}
          >
            {item}
          </a>
        ))}
        <a
          className="header-action-mobile"
          href="#upload"
          onClick={() => setIsOpen(false)}
        >
          Analyze contract
        </a>
      </nav>

      <a className="header-action" href="#upload">
        Analyze contract
      </a>
    </header>
  );
}
