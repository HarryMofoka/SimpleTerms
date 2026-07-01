const navItems = ["How it works", "Report", "Security", "Roadmap"];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="SimpleTerms home">
        <span className="brand-mark" aria-hidden="true">
          ST
        </span>
        <span>SimpleTerms</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
            {item}
          </a>
        ))}
      </nav>
      <a className="header-action" href="#upload">
        Analyze contract
      </a>
    </header>
  );
}
