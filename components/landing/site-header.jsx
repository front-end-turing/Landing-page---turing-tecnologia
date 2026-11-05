'use client';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { getContactHref } from '../../lib/site-config.js';
import { Logo, SmoothAnchor, Destination } from './site-links.jsx';
const navigation = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#sobre', label: 'Sobre Nós' },
  { href: '#portfolio', label: 'Portfólio' },
  { href: '#faca-parte', label: 'Faça Parte' },
];
export function SiteHeader({ onUnavailable }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('resize', resize);
    };
  }, [menuOpen]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <SmoothAnchor
          className="brand"
          href="#inicio"
          aria-label="Turing Tecnologia — início"
        >
          <Logo />
        </SmoothAnchor>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <SmoothAnchor className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </SmoothAnchor>
          ))}
        </nav>
        <Destination
          className="button button-primary header-contact"
          href={getContactHref()}
          onUnavailable={onUnavailable}
        >
          Fale Conosco
        </Destination>
        <button
          className="menu-toggle"
          type="button"
          ref={menuButton}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav
          className="mobile-nav"
          id="mobile-menu"
          aria-label="Navegação mobile"
        >
          {navigation.map((item) => (
            <SmoothAnchor
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </SmoothAnchor>
          ))}
        </nav>
      )}
    </header>
  );
}
