'use client';
import { Globe, CodeXml, MessagesSquare } from 'lucide-react';
import { getContactHref, projects, siteConfig } from '../../lib/site-config.js';
import { SmoothAnchor, Destination } from './site-links.jsx';
import { TeamCarousel } from './team-carousel.jsx';
import { ApplicationForm } from './application-form.jsx';
export function HeroSection({ onUnavailable }) {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-inner">
        <p className="eyebrow">EMPRESA JÚNIOR DE TECNOLOGIA · UFERSA ANGICOS</p>
        <h1 id="hero-title">Turing Tecnologia</h1>
        <p className="hero-description">
          Desenvolvemos sites, softwares e consultoria, enquanto formamos
          <br className="desktop-break" /> futuros profissionais de tecnologia
          do semiárido potiguar.
        </p>
        <div className="hero-actions">
          <Destination
            className="button button-primary"
            href={getContactHref()}
            onUnavailable={onUnavailable}
          >
            Fale Conosco
          </Destination>
          <SmoothAnchor className="button button-secondary" href="#servicos">
            Ver Serviços
          </SmoothAnchor>
        </div>
      </div>
    </section>
  );
}
export function ServicesSection() {
  return (
    <section
      className="section services"
      id="servicos"
      aria-labelledby="services-title"
    >
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">SERVIÇOS</p>
          <h2 id="services-title">O que fazemos</h2>
        </div>
        <div className="services-grid">
          <article className="service-card" data-reveal="0">
            <div className="service-icon">
              <Globe size={24} />
            </div>
            <h3>Web</h3>
            <p>
              Sites completos, personalizados e interativos com as tecnologias
              mais modernas do mercado.
            </p>
          </article>
          <article className="service-card" data-reveal="1">
            <div className="service-icon">
              <CodeXml size={24} />
            </div>
            <h3>Software</h3>
            <p>
              Sistemas sob medida para automatizar processos manuais e organizar
              as informações do seu negócio.
            </p>
          </article>
          <article className="service-card" data-reveal="2">
            <div className="service-icon">
              <MessagesSquare size={24} />
            </div>
            <h3>Consultoria</h3>
            <p>
              Orientação estratégica e treinamento para potencializar a
              tecnologia dentro da sua empresa.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
export function AboutSection({ onUnavailable }) {
  return (
    <section className="section about" id="sobre" aria-labelledby="about-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">SOBRE NÓS</p>
          <h2 id="about-title">Formando talentos, entregando resultado real</h2>
        </div>
        <p className="about-description" data-reveal>
          A Turing Tecnologia foi fundada em 28/11/2019 por Cleyton Rage de
          Assunção, Anderson Cirilo Valentim e Alice Marrocos, sob orientação da
          professora Valquiria Melo de Souza, com o objetivo de proporcionar aos
          discentes do semiárido a experiência em uma empresa real e
          oportunidades no mercado tecnológico, contando com dirigentes e
          mentores para seu desenvolvimento tecnológico, social e estratégico.
        </p>
        <div className="stats" data-reveal>
          {siteConfig.stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <TeamCarousel onUnavailable={onUnavailable} />
      </div>
    </section>
  );
}
export function PortfolioSection() {
  return (
    <section
      className="section portfolio"
      id="portfolio"
      aria-labelledby="portfolio-title"
    >
      <div className="container">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">PORTFÓLIO</p>
          <h2 id="portfolio-title">Projetos que já saíram do papel</h2>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => {
            const content = (
              <>
                <div className="project-preview" data-project={project.id}>
                  {project.image && (
                    <img
                      src={project.image}
                      alt={`Logo ${project.name}`}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div className="project-info">
                  <p className="project-category">{project.category}</p>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
              </>
            );
            return (
              <article
                className="project-card"
                key={project.id}
                data-reveal={index}
              >
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function RecruitmentSection() {
  return (
    <section
      className="recruitment"
      id="faca-parte"
      aria-labelledby="recruitment-title"
    >
      <div className="container" data-reveal>
        <h2 id="recruitment-title">Faça parte do nosso time</h2>
        <p>
          Estamos sempre em busca de estudantes que querem sair da teoria e
          colocar a mão na massa em projetos reais.
        </p>
        <SmoothAnchor className="button button-white" href="#candidatura">
          Candidate-se agora
        </SmoothAnchor>
      </div>
    </section>
  );
}
export function ApplicationSection() {
  return (
    <section
      className="section application"
      id="candidatura"
      aria-labelledby="application-title"
    >
      <div className="section-heading" data-reveal>
        <p className="eyebrow">RECRUTAMENTO</p>
        <h2 id="application-title">Candidate-se para a Turing</h2>
        <p>
          Preencha o formulário abaixo com seus dados. Nossa equipe entrará em
          contato em breve.
        </p>
      </div>
      <div className="application-panel" data-reveal>
        <ApplicationForm />
      </div>
    </section>
  );
}
