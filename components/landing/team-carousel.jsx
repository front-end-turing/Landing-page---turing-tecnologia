'use client';
import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCarouselInterval } from '../../lib/site-config.js';
import { members } from '../../lib/team-data.js';
import { startCarouselAutoplay } from '../../lib/page-motion.js';
import { MemberCard } from './member-card.jsx';
/** Uma única faixa: presidência, diretores e suas equipes, na ordem do cadastro. */
export function TeamCarousel({ onUnavailable }) {
  const [viewportRef, carousel] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    duration: 30,
    inViewThreshold: 0.5,
  });
  const [interval, setIntervalMs] = useState(10000);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState([0, 1, 2, 3, 4]);
  const region = useRef(null);
  useEffect(() => {
    const resize = () => setIntervalMs(getCarouselInterval(window.innerWidth));
    resize();
    window.addEventListener('resize', resize);
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    if (region.current) observer.observe(region.current);
    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!carousel) return;
    const updateVisible = () => setVisibleSlides(carousel.slidesInView());
    updateVisible();
    carousel.on('slidesInView', updateVisible);
    carousel.on('reInit', updateVisible);
    return () => {
      carousel.off('slidesInView', updateVisible);
      carousel.off('reInit', updateVisible);
    };
  }, [carousel]);
  useEffect(() => {
    if (!carousel || focused || paused || !inView) return;
    return startCarouselAutoplay(
      () => carousel.scrollNext(),
      interval,
      // Não troca o cartão enquanto a pessoa lê o aviso de contato.
      () =>
        document.hidden || Boolean(document.querySelector('[role="dialog"]')),
    );
  }, [carousel, interval, focused, paused, inView]);
  // Antecipa as duas próximas fotos e a anterior, inclusive na volta da faixa.
  const imagesToPreload = new Set(
    visibleSlides.flatMap((index) =>
      [-1, 0, 1, 2].map(
        (offset) => (index + offset + members.length) % members.length,
      ),
    ),
  );
  return (
    <div className="team-section" id="membros" data-reveal>
      <h3 id="team-title">Conheça quem faz acontecer</h3>
      <div
        className="team-carousel"
        ref={region}
        role="region"
        aria-roledescription="carrossel"
        aria-labelledby="team-title"
        onFocusCapture={(event) => {
          setFocused(
            Boolean(event.target.closest('.member-card')) &&
              event.target.matches(':focus-visible'),
          );
        }}
        onPointerDownCapture={() => setFocused(false)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <button
          className="carousel-pause"
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused
            ? 'Retomar passagem automática'
            : 'Pausar passagem automática'}
        </button>
        <button
          className="carousel-arrow carousel-previous"
          onClick={() => carousel?.scrollPrev()}
          type="button"
          aria-label="Membro anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="team-viewport" ref={viewportRef}>
          <div className="team-track">
            {members.map((member, index) => (
              <div
                className="team-slide"
                key={member.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${members.length}`}
                aria-hidden={!visibleSlides.includes(index)}
                inert={!visibleSlides.includes(index)}
              >
                <MemberCard
                  member={member}
                  onUnavailable={onUnavailable}
                  preload={imagesToPreload.has(index)}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          className="carousel-arrow carousel-next"
          onClick={() => carousel?.scrollNext()}
          type="button"
          aria-label="Próximo membro"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
