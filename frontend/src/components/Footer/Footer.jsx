import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

/* Edit these values. Nothing else in the file needs to change. */
const SITE = "Yegnabet.com";

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "#about" },
  { label: "Delivery", href: "#delivery" },
  { label: "Privacy policy", href: "#privacy" },
];

const CONTACTS = [
  {
    key: "phone",
    label: "+251 9XX XXX XXX",
    href: "tel:+2519XXXXXXXX",
  },
  {
    key: "email",
    label: "hello@yegnabet.com",
    href: "mailto:hello@yegnabet.com",
  },
  { key: "address", label: "Your street, your city, Ethiopia" },
  { key: "hours", label: "Every day, 8:00 AM to 10:00 PM" },
];

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com/", icon: assets.facebook_icon },
  { label: "Twitter", href: "https://twitter.com/", icon: assets.twitter_icon },
  { label: "LinkedIn", href: "https://linkedin.com/", icon: assets.linkedin_icon },
];

const ICON_PATHS = {
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  email: "M3 6h18v12H3zM3 7l9 7 9-7",
  address:
    "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  hours: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};

const ContactIcon = ({ name }) => (
  <svg
    className="footer-contact-icon"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICON_PATHS[name]} />
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        {/* brand */}
        <div className="footer-content-left">
          <img
            src={assets.logo}
            alt={SITE}
            className="footer-logo"
            loading="lazy"
            decoding="async"
          />
          <p>
            Fresh food from kitchens near you, cooked to order and delivered to
            your door.
          </p>
          <ul className="footer-social-icon" aria-label="Social media">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  <img src={s.icon} alt="" loading="lazy" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* company */}
        <nav className="footer-content-center" aria-labelledby="footer-company">
          <h3 id="footer-company">Company</h3>
          <ul className="footer-list">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <a className="footer-link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* contact */}
        <div className="footer-content-right">
          <h3 id="footer-contact">Get in touch</h3>
          <address aria-labelledby="footer-contact">
            <ul className="footer-list">
              {CONTACTS.map((c) => (
                <li key={c.key} className="footer-contact">
                  <ContactIcon name={c.key} />
                  {c.href ? (
                    <a className="footer-link" href={c.href}>
                      {c.label}
                    </a>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </address>
        </div>
      </div>

      <hr />
      <p className="footer-copyright">
        © {new Date().getFullYear()} {SITE}. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;