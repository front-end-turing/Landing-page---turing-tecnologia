import { courses, roles } from '../lib/site-config.js';
import { getSocialHref } from '../lib/social-links.js';
/** Aceita somente os campos previstos; dados extras nunca chegam ao armazenamento. */
export function validateApplication(input) {
  const invalid = (message) => ({
    success: false,
    message,
  });
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return invalid('Envie os dados do formulário.');
  const fields = input;
  const limits = {
    nome: 120,
    matricula: 30,
    email: 254,
    celular: 25,
    periodoIngresso: 12,
    curso: 60,
    github: 300,
    area: 30,
  };
  const data = {};
  for (const key of Object.keys(limits)) {
    const value = fields[key] ?? (key === 'github' ? '' : undefined);
    if (typeof value !== 'string' || value.trim().length > limits[key])
      return invalid('Revise os campos do formulário.');
    data[key] = value.trim();
    if (key !== 'github' && !data[key])
      return invalid('Preencha todos os campos obrigatórios.');
  }
  if (data.nome.length < 3) return invalid('Informe seu nome completo.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return invalid('Informe um e-mail válido.');
  if (
    !/^[+\d\s().-]+$/.test(data.celular) ||
    !/^\d{10,15}$/.test(data.celular.replace(/\D/g, ''))
  )
    return invalid('Informe um celular com DDD.');
  if (!/^\d{4}[./-][12]$/.test(data.periodoIngresso))
    return invalid('Informe o período no formato 2025.1 ou 2025.2.');
  if (!courses.some(({ value }) => value === data.curso))
    return invalid('Selecione um curso válido.');
  if (!roles.some(({ value }) => value === data.area))
    return invalid('Selecione uma vaga válida.');
  if (data.github) {
    const profile = getSocialHref('github', data.github);
    if (!profile)
      return invalid(
        'Informe um perfil válido do GitHub ou deixe o campo vazio.',
      );
    data.github = profile;
  }
  data.email = data.email.toLowerCase();
  return { success: true, data };
}
