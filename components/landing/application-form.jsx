'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';
import { courses, roles, siteConfig } from '../../lib/site-config.js';
import { ApplicationError, sendApplication } from '../../lib/applications.js';
export function ApplicationForm() {
  const [course, setCourse] = useState(null);
  const [area, setArea] = useState(null);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const controllerRef = useRef(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  async function submit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!course || !area) {
      setStatus('Selecione seu curso e a vaga desejada.');
      return;
    }
    const data = new FormData(form);
    const value = (name) => String(data.get(name) ?? '').trim();
    const payload = {
      nome: value('nome'),
      matricula: value('matricula'),
      email: value('email'),
      celular: value('celular'),
      periodoIngresso: value('periodoIngresso'),
      curso: course,
      github: value('github'),
      area,
    };
    if (
      !payload.nome ||
      !payload.matricula ||
      !payload.celular ||
      !payload.periodoIngresso
    ) {
      setStatus('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!siteConfig.application.endpoint) {
      setStatus(
        'As candidaturas on-line ainda não estão disponíveis. Seus dados não foram enviados.',
      );
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setStatus('');
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      await sendApplication(
        { ...payload, website: value('website') },
        controller.signal,
      );
      setStatus('Candidatura enviada! Nossa equipe entrará em contato.');
      form.reset();
      setCourse(null);
      setArea(null);
    } catch (error) {
      setStatus(
        error instanceof ApplicationError
          ? error.message
          : 'Não foi possível enviar sua candidatura. Seus dados foram mantidos para você tentar novamente.',
      );
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      setSubmitting(false);
      controllerRef.current = null;
    }
  }
  return (
    <form
      className="application-form"
      onSubmit={submit}
      aria-label="Formulário de candidatura"
    >
      <div hidden aria-hidden="true">
        <label htmlFor="website">Site pessoal (deixe vazio)</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-field">
        <label htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          name="nome"
          placeholder="Digite seu nome completo"
          autoComplete="name"
          maxLength={120}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="matricula">Matrícula</label>
        <input
          id="matricula"
          name="matricula"
          placeholder="Ex: 2023012345"
          inputMode="numeric"
          maxLength={30}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="celular">Número celular</label>
        <input
          id="celular"
          name="celular"
          type="tel"
          placeholder="(84) 9 9999-9999"
          autoComplete="tel"
          maxLength={25}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="periodoIngresso">Período de ingresso</label>
        <input
          id="periodoIngresso"
          name="periodoIngresso"
          placeholder="Ex: 2025.1"
          maxLength={12}
          required
        />
      </div>
      <div className="form-field">
        <label id="curso-label" htmlFor="curso">
          Curso
        </label>
        <Select
          items={courses}
          value={course}
          onValueChange={setCourse}
          name="curso"
          required
        >
          <SelectTrigger
            className="form-select"
            id="curso"
            aria-labelledby="curso-label"
          >
            <SelectValue placeholder="Sistemas de Informação / Licenciatura em Informática" />
          </SelectTrigger>
          <SelectContent className="form-options" alignItemWithTrigger={false}>
            {courses.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="form-field">
        <label htmlFor="github">GitHub (opcional)</label>
        <input
          id="github"
          name="github"
          placeholder="github.com/seuusuario"
          maxLength={300}
          autoCapitalize="none"
          spellCheck={false}
        />
      </div>
      <div className="form-field">
        <label id="area-label" htmlFor="area">
          Vaga desejada
        </label>
        <Select
          items={roles}
          value={area}
          onValueChange={setArea}
          name="area"
          required
        >
          <SelectTrigger
            className="form-select"
            id="area"
            aria-labelledby="area-label"
          >
            <SelectValue placeholder="Selecione a área de interesse" />
          </SelectTrigger>
          <SelectContent className="form-options" alignItemWithTrigger={false}>
            {roles.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        className="button button-primary application-submit"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Enviando candidatura…' : 'Enviar candidatura'}
      </button>
      {status && (
        <p className="form-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
