'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog.jsx';
import { useScrollReveal } from '../hooks/use-scroll-reveal.js';
import { cancelSectionScroll } from '../lib/page-motion.js';
import { SiteHeader } from './landing/site-header.jsx';
import { SiteFooter } from './landing/site-footer.jsx';
import {
  HeroSection,
  ServicesSection,
  AboutSection,
  PortfolioSection,
  RecruitmentSection,
  ApplicationSection,
} from './landing/page-sections.jsx';
/** Composição da página. Conteúdo, interações e integração ficam em arquivos próprios. */
export function LandingPage() {
  const [unavailable, setUnavailable] = useState(false);
  const revealRef = useScrollReveal();
  const showUnavailable = () => setUnavailable(true);
  useEffect(() => cancelSectionScroll, []);
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <SiteHeader onUnavailable={showUnavailable} />
      <main id="conteudo" ref={revealRef}>
        <HeroSection onUnavailable={showUnavailable} />
        <ServicesSection />
        <AboutSection onUnavailable={showUnavailable} />
        <PortfolioSection />
        <RecruitmentSection />
        <ApplicationSection />
      </main>
      <SiteFooter onUnavailable={showUnavailable} />
      <Dialog open={unavailable} onOpenChange={setUnavailable}>
        <DialogContent className="contact-dialog" showCloseButton={false}>
          <DialogTitle>Contato em breve</DialogTitle>
          <DialogDescription>
            Este canal de contato ainda não está disponível. Volte em breve para
            falar com a equipe da Turing.
          </DialogDescription>
          <DialogClose className="button button-primary">Entendi</DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
