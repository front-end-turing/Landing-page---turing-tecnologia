'use client';
import { Github, Instagram, Linkedin } from '../social-icons.jsx';
import { scrollToSection } from '../../lib/page-motion.js';
import { siteConfig } from '../../lib/site-config.js';
import { getSocialHref } from '../../lib/social-links.js';
export function Logo({ inverse = false }) {
  const source = inverse ? siteConfig.logoInverse : siteConfig.logo;
  return (
    <img
      className="brand-image"
      src={source}
      alt="Turing Tecnologia"
      width={42}
      height={46}
    />
  );
}
export function SmoothAnchor({ href, onClick, children, ...props }) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        scrollToSection(event, href);
      }}
    >
      {children}
    </a>
  );
}
export function Destination({
  href,
  children,
  className,
  label,
  onUnavailable,
}) {
  return href ? (
    <a
      href={href}
      className={className}
      aria-label={label}
      target={href.startsWith('https://') ? '_blank' : undefined}
      rel={href.startsWith('https://') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={onUnavailable}
    >
      {children}
    </button>
  );
}
export function SocialLinks({ member, onUnavailable }) {
  const links = member ?? siteConfig.contact;
  const suffix = member ? ` de ${member.name ?? member.role}` : ' da Turing';
  return (
    <div className="social-links">
      <Destination
        href={
          member ? getSocialHref('linkedin', links.linkedin) : links.linkedin
        }
        label={`LinkedIn${suffix}`}
        onUnavailable={onUnavailable}
      >
        <Linkedin size={17} />
      </Destination>
      <Destination
        href={
          member ? getSocialHref('instagram', links.instagram) : links.instagram
        }
        label={`Instagram${suffix}`}
        onUnavailable={onUnavailable}
      >
        <Instagram size={17} />
      </Destination>
      <Destination
        href={member ? getSocialHref('github', links.github) : links.github}
        label={`GitHub${suffix}`}
        onUnavailable={onUnavailable}
      >
        <Github size={17} />
      </Destination>
    </div>
  );
}
