/** O mouse e o foco das setas não interrompem a passagem automática. */
export function startCarouselAutoplay(advance, delay, shouldPause) {
  const timer = setInterval(() => {
    if (!shouldPause()) advance();
  }, delay);
  return () => clearInterval(timer);
}
const SCROLL_MIN_DURATION_MS = 800;
const SCROLL_MAX_DURATION_MS = 1100;
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Tab',
  'Escape',
]);
let activeScrollCleanup = null;
/** Interrompe a rolagem pendente ao navegar de novo ou desmontar a página. */
export function cancelSectionScroll() {
  activeScrollCleanup?.();
}
function easeInOutCubic(progress) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}
/**
 * Anima a posição real a cada frame, sem depender da animação nativa do navegador.
 * Só atualiza a âncora ao terminar, evitando um salto de navegação durante o movimento.
 */
function animateToSection(section, href) {
  cancelSectionScroll();
  let frame = 0;
  let startedAt = null;
  let origin = 0;
  let destination = 0;
  let duration = SCROLL_MIN_DURATION_MS;
  const cleanup = () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('wheel', cleanup);
    window.removeEventListener('touchstart', cleanup);
    window.removeEventListener('pointerdown', cleanup);
    window.removeEventListener('popstate', cleanup);
    window.removeEventListener('keydown', onKeyDown);
    if (activeScrollCleanup === cleanup) activeScrollCleanup = null;
  };
  const onKeyDown = (event) => {
    if (SCROLL_KEYS.has(event.key)) cleanup();
  };
  const step = (timestamp) => {
    if (startedAt === null) {
      // Mede depois do clique, já com o menu mobile fechado.
      startedAt = timestamp;
      origin = window.scrollY;
      const padding =
        parseFloat(
          window.getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      const margin =
        parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      destination = Math.max(
        0,
        Math.min(
          maxScroll,
          origin + section.getBoundingClientRect().top - padding - margin,
        ),
      );
      duration = Math.min(
        SCROLL_MAX_DURATION_MS,
        Math.max(SCROLL_MIN_DURATION_MS, Math.abs(destination - origin) * 0.4),
      );
    }
    const progress = Math.min(1, (timestamp - startedAt) / duration);
    // 'instant' em cada frame evita acumular animações CSS/nativas concorrentes.
    window.scrollTo({
      top: origin + (destination - origin) * easeInOutCubic(progress),
      behavior: 'instant',
    });
    if (progress < 1) {
      frame = window.requestAnimationFrame(step);
      return;
    }
    cleanup();
    if (window.location.hash !== href)
      window.history.pushState(window.history.state, '', href);
  };
  activeScrollCleanup = cleanup;
  window.addEventListener('wheel', cleanup, { passive: true });
  window.addEventListener('touchstart', cleanup, { passive: true });
  window.addEventListener('pointerdown', cleanup, { passive: true });
  window.addEventListener('popstate', cleanup);
  window.addEventListener('keydown', onKeyDown);
  frame = window.requestAnimationFrame(step);
}
/** Mantém cliques modificados e destinos inexistentes com o comportamento nativo. */
export function scrollToSection(event, href) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !href.startsWith('#')
  )
    return;
  const section = document.getElementById(href.slice(1));
  if (!section) return;
  event.preventDefault();
  animateToSection(section, href);
}
