/**
 * TURING — INTEGRAÇÃO DO BACK-END
 * Preencha os destinos abaixo com URLs completas. null = não configurado.
 * Arquivo público no navegador: nunca inclua credenciais ou segredos.
 */
export const siteConfig = {
  name: 'Turing Tecnologia',
  // PNGs originais fornecidos pela Turing: gradiente no cabeçalho, branco no rodapé.
  logo: '/images/logo-gradiente.png',
  logoInverse: '/images/logo-branca.png',
  contact: {
    email: 'turing.tecnologia@ufersa.edu.br', // E-mail clicável no rodapé.
    instagram: 'https://www.instagram.com/turingtecnologia/', // Destino dos botões Fale Conosco.
    linkedin: 'https://br.linkedin.com/company/turing-tec',
    github: 'https://github.com/Turing-Tecnologia',
  },
  application: {
    endpoint: '/api/candidaturas', // Vercel Function em api/candidaturas.js.
    // Sucesso: HTTP 2xx + { success: true }. Validar dados no servidor.
  },
  stats: [
    { value: '2019', label: 'Fundação' },
    { value: '20+', label: 'Membros ativos' },
    { value: '10+', label: 'Projetos entregues' },
  ],
};
export const roles = [
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'back-end', label: 'Back-end' },
  { value: 'front-end', label: 'Front-end' },
  { value: 'ui-ux', label: 'UI/UX' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'financeiro', label: 'Financeiro' },
];
export const courses = [
  { value: 'sistemas-de-informacao', label: 'Sistemas de Informação' },
  {
    value: 'licenciatura-em-informatica',
    label: 'Licenciatura em Informática',
  },
];
export const projects = [
  {
    id: 'soma',
    name: 'Soma Soluções Consultoria',
    category: 'Landing Page',
    description:
      'Landing page institucional com interface moderna para apresentar os diferenciais estratégicos da empresa.',
    image: '/images/optimized/projetos/soma-logo.webp', // Versão WebP; original preservado em public/images/projetos.
    url: null, // URL do projeto; null mantém o cartão sem link.
  },
  {
    id: 'covol-19',
    name: 'COVOL-19',
    category: 'Plataforma Social',
    description:
      'Plataforma que conecta voluntários a idosos em situação de vulnerabilidade, em parceria com o NIC/UFERSA.',
    image: '/images/optimized/projetos/covol-19.webp', // WebP sem perdas a partir da logo original do COVOL-19.
    url: null,
  },
];
export function getContactHref() {
  // Fale Conosco abre o Instagram, conforme solicitado. O rodapé usa mailto separadamente.
  if (siteConfig.contact.instagram) return siteConfig.contact.instagram;
  if (siteConfig.contact.email) return `mailto:${siteConfig.contact.email}`;
  return null;
}
export function getCarouselInterval(width) {
  return width >= 1024 ? 10000 : width >= 768 ? 6000 : 3000;
}
