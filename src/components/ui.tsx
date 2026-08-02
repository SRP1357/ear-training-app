import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Screen({
  children,
  home = false,
}: {
  children: ReactNode;
  home?: boolean;
}) {
  return <div className={home ? 'screen screen--home' : 'screen'}>{children}</div>;
}

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="page-header">
      <Link to="/" className="back-link">
        ← Home
      </Link>
      <h1 className="page-title">{title}</h1>
    </header>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className="title">{children}</h1>;
}

export function Body({ children }: { children: ReactNode }) {
  return <p className="body">{children}</p>;
}

export function CardButton({
  title,
  subtitle,
  to,
}: {
  title: string;
  subtitle: string;
  to: string;
}) {
  return (
    <Link to={to} className="card">
      <p className="card-title">{title}</p>
      <p className="card-sub">{subtitle}</p>
      <div className="card-rule" />
    </Link>
  );
}

export function PrimaryButton({
  label,
  ...props
}: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="btn-primary" {...props}>
      {label}
    </button>
  );
}

export function GhostButton({
  label,
  ...props
}: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="btn-ghost" {...props}>
      {label}
    </button>
  );
}

export function ChoiceButton({
  label,
  state = 'idle',
  ...props
}: {
  label: string;
  state?: 'idle' | 'correct' | 'wrong' | 'muted';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const stateClass =
    state === 'correct'
      ? 'choice--correct'
      : state === 'wrong'
        ? 'choice--wrong'
        : state === 'muted'
          ? 'choice--muted'
          : '';
  return (
    <button type="button" className={`choice ${stateClass}`.trim()} {...props}>
      {label}
    </button>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return <div className="panel">{children}</div>;
}

export function StatusPill({
  tone,
  label,
}: {
  tone: 'neutral' | 'success' | 'danger';
  label: string;
}) {
  const toneClass =
    tone === 'success' ? 'pill--success' : tone === 'danger' ? 'pill--danger' : '';
  return <span className={`pill ${toneClass}`.trim()}>{label}</span>;
}
