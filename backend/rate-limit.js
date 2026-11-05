/**
 * Limite simples por IP, em memória. Cada instância da função tem o próprio
 * contador, então é uma proteção de melhor esforço contra spam do formulário.
 * Para um limite global, configure também uma regra de Rate Limit no
 * Firewall da Vercel (veja o README).
 */
export function createRateLimiter({ limit = 10, windowMs = 60_000 } = {}) {
  const hits = new Map();
  return function isRateLimited(key, now = Date.now()) {
    // Evita crescer sem limite em instâncias que ficam muito tempo ativas.
    if (hits.size > 5000) {
      for (const [k, entry] of hits) if (entry.reset <= now) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}

/** Na Vercel, o primeiro IP de x-forwarded-for é definido pela própria plataforma. */
export function getClientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'desconhecido'
  );
}
