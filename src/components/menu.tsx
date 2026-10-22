"use client";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { site, formatPrice } from "@/site.config";

export function FullMenu() {
  const [category, setCategory] = useState("all");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = site.menu.filter(
    (item) => category === "all" || item.category === category,
  );
  const handleKeys = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % site.categories.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + site.categories.length) % site.categories.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = site.categories.length - 1;
    else return;
    event.preventDefault();
    setCategory(site.categories[next].id);
    tabs.current[next]?.focus();
  };
  return (
    <section className="full-menu" id="menu" aria-labelledby="menu-heading">
      <div className="menu-heading-row">
        <div>
          <p className="section-kicker">✳ {site.ui.menuEyebrow}</p>
          <h2 id="menu-heading">
            {site.ui.menuTitle}
            <br />
            <span>{site.ui.menuTitleAccent}</span>
          </h2>
          <p className="section-copy">{site.ui.menuCopy}</p>
        </div>
        <span className="menu-stamp" lang="zh-Hans">
          {site.ui.menuChinese}
          <small>{site.name}</small>
        </span>
      </div>
      <div className="menu-tabs" role="tablist" aria-label={site.ui.menuLabel}>
        {site.categories.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={category === tab.id}
            tabIndex={category === tab.id ? 0 : -1}
            aria-controls="menu-panel"
            onClick={() => setCategory(tab.id)}
            onKeyDown={(event) => handleKeys(event, index)}
          >
            {tab.label}
            <span>
              {tab.id === "all"
                ? site.menu.length
                : site.menu.filter((item) => item.category === tab.id).length}
            </span>
          </button>
        ))}
      </div>
      <div
        className="menu-grid"
        id="menu-panel"
        role="tabpanel"
        aria-labelledby={`tab-${category}`}
        tabIndex={0}
      >
        {items.map((item, index) => (
          <article
            className="menu-card"
            key={item.id}
            style={
              {
                "--tile-color":
                  site.colors[item.color as keyof typeof site.colors],
                "--tilt": `${[-1.2, 0.8, -0.6, 1.3][index % 4]}deg`,
              } as CSSProperties
            }
          >
            <div className={`menu-tile ${item.image ? "has-photo" : ""}`}>
              {item.image ? (
                <img
                  src={item.image}
                  width="960"
                  height={item.hero ? "548" : "640"}
                  loading="lazy"
                  decoding="async"
                  alt={item.name}
                />
              ) : (
                <span
                  className="tile-character"
                  lang="zh-Hans"
                  aria-hidden="true"
                  data-character={item.chinese.slice(0, 2)}
                />
              )}
              <span className="tile-name" lang="zh-Hans">
                {item.chinese}
              </span>
              {item.veg && (
                <span className="veg-sticker">{site.ui.vegetarian} ↗</span>
              )}
              {item.hero && (
                <span className="hero-sticker">✦ {site.ui.signature}</span>
              )}
            </div>
            <div className="card-body">
              <div className="card-name">
                <h3>{item.name}</h3>
                <strong>{formatPrice(item.price)}</strong>
              </div>
              <p>{item.description}</p>
              <div className="card-bottom">
                <span
                  className="card-heat"
                  role="img"
                  aria-label={`${site.ui.spiceLabel}: ${item.spice}/3`}
                >
                  {[0, 1, 2].map((n) => (
                    <svg
                      key={n}
                      className={n < item.spice ? "hot" : ""}
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M22 9c-2 12-8 15-18 14 8-3 9-11 11-14 2-3 6-3 7 0Z" />
                      <path d="M19 8c0-5 4-5 6-4" />
                    </svg>
                  ))}
                </span>
                <a
                  className="card-order"
                  href={site.orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.ui.add}: ${item.name}`}
                >
                  {site.ui.add}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="menu-fineprint">
        <span>{site.ui.menuNote}</span>
        <span>{site.ui.menuAllergens}</span>
      </div>
    </section>
  );
}

export function Vibes() {
  return (
    <section className="vibes" aria-label={site.ui.instagram}>
      {[0, 1].map((row) => (
        <div className={`ticker ticker-${row}`} key={row}>
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div
                className="ticker-content"
                key={copy}
                aria-hidden={copy === 1}
              >
                {site.tickers.map((text) => (
                  <span key={text}>
                    {text}
                    <i aria-hidden="true">✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function Visit() {
  return (
    <section id="visit" className="visit" aria-labelledby="visit-heading">
      <div className="visit-main">
        <p className="section-kicker">✳ {site.ui.visitEyebrow}</p>
        <h2 id="visit-heading">
          {site.ui.visitTitle[0]}
          <br />
          {site.ui.visitTitle[1]}
        </h2>
        <p className="section-copy">{site.ui.visitCopy}</p>
        <a
          className="button booking-button"
          href={site.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {site.ui.book}
          <span>↗</span>
        </a>
      </div>
      <div className="visit-ticket">
        <div className="ticket-top">
          <span className="ticket-chinese" lang="zh-Hans">
            {site.ui.visitChinese}
          </span>
          <span className="visit-sticker">{site.ui.visitSticker}</span>
        </div>
        <div className="ticket-info">
          <h3>{site.ui.visitAddressLabel}</h3>
          <address>{site.address}</address>
          <a href={site.mapUrl} target="_blank" rel="noopener noreferrer">
            {site.ui.map}
            <span>↗</span>
          </a>
        </div>
        <div className="ticket-info">
          <h3>{site.ui.visitHoursLabel}</h3>
          <p>{site.hours}</p>
        </div>
        <a
          className="ticket-social"
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {site.ui.instagram}
          <span>↗</span>
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span>{site.ui.footerLine}</span>
        <a href="#xiaolongbao">{site.ui.backTop} ↑</a>
      </div>
      <a className="footer-wordmark" href="#xiaolongbao">
        {site.name}
      </a>
      <div className="footer-bottom">
        <span>{site.ui.copyright}</span>
        <span>{site.ui.footerCredit} ↗</span>
      </div>
      <p className="template-note">{site.ui.demoNote}</p>
    </footer>
  );
}
