'use client';
import { useEffect, useRef } from 'react';
/** Anima cada bloco uma vez. Sem JavaScript/IntersectionObserver, tudo permanece visível. */
export function useScrollReveal() {
  const root = useRef(null);
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === 'undefined') return;
    const elements = root.current.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -32px 0px' },
    );
    for (const element of elements) {
      // Não esconde conteúdo que já está sendo lido ao carregar um link com âncora.
      if (element.getBoundingClientRect().top < window.innerHeight - 32)
        continue;
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
    return () => {
      observer.disconnect();
      elements.forEach((element) =>
        element.classList.remove('reveal-pending', 'is-visible'),
      );
    };
  }, []);
  return root;
}
