'use client';
import { siteConfig } from '../../lib/site-config.js';
import { Logo, SmoothAnchor, Destination, SocialLinks } from './site-links.jsx';
export function SiteFooter({ onUnavailable }) {
  const [emailName, emailDomain] = siteConfig.contact.email.split('@');
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <SmoothAnchor href="#inicio" className="footer-brand">
          <Logo inverse />
          <span>
            <strong>Turing Tecnologia</strong>
            <small>© Todos os direitos reservados.</small>
          </span>
        </SmoothAnchor>
        <div className="footer-contact">
          <Destination
            href={`mailto:${siteConfig.contact.email}`}
            onUnavailable={onUnavailable}
            className="footer-email"
          >
            {emailName}
            <wbr />@{emailDomain}
          </Destination>
          <SocialLinks onUnavailable={onUnavailable} />
        </div>
      </div>
    </footer>
  );
}
