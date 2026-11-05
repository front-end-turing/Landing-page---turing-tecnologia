/** Converte respostas do formulário em perfis clicáveis, sem parâmetros de compartilhamento. */
export function getSocialHref(network, value) {
  const input = value?.trim();
  if (!input || /\s/.test(input) || input === '.') return null;
  const host = `${network}.com`;
  const candidate = /^https?:\/\//i.test(input)
    ? input
    : input.includes(`${host}/`)
      ? `https://${input}`
      : `https://${host}/${network === 'linkedin' ? 'in/' : ''}${input.replace(/^@/, '')}`;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./, '');
    if (
      hostname !== host &&
      !(network === 'linkedin' && /^[a-z]{2}\.linkedin\.com$/.test(hostname))
    )
      return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if (network === 'linkedin') {
      return segments[0] === 'in' && segments[1]
        ? `https://www.linkedin.com/in/${segments[1]}/`
        : null;
    }
    const username = segments[0];
    const valid =
      network === 'github' ? /^[a-z0-9-]{1,39}$/i : /^[a-z0-9._]{1,30}$/i;
    if (!username || !valid.test(username)) return null;
    return `https://${network === 'instagram' ? 'www.' : ''}${host}/${username}${network === 'instagram' ? '/' : ''}`;
  } catch {
    return null;
  }
}
