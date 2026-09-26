import { ArrowLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDocumentTitle } from '../lib/hooks';

interface HeaderProps {
  title: string;
  subtitle?: string | undefined;
  /** Where the back button goes; `-1` for history back. Omit for top-level screens. */
  back?: string | -1;
  /** Show a close (✕) button instead of back, e.g. inside a lesson. */
  close?: boolean;
  actions?: ReactNode;
}

export function Header({ title, subtitle, back, close, actions }: HeaderProps) {
  const navigate = useNavigate();
  useDocumentTitle(title);
  return (
    <header className="page-header">
      {back !== undefined && (
        <button
          type="button"
          className="icon-btn"
          aria-label={close ? 'Close' : 'Back'}
          onClick={() => (back === -1 ? navigate(-1) : navigate(back))}
        >
          {close ? <X size={22} /> : <ArrowLeft size={22} />}
        </button>
      )}
      <div className="grow">
        <h1>{title}</h1>
        {subtitle && <div className="sub">{subtitle}</div>}
      </div>
      {actions}
    </header>
  );
}

/** Dutch text: tagged so screen readers switch to Dutch pronunciation. */
export function Nl({ children, className = 'nl' }: { children: ReactNode; className?: string }) {
  return (
    <span lang="nl" className={className}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={`progress${accent ? ' accent' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty stack">
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="sr-live">
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </div>
  );
}

export function ListLink({
  to,
  icon,
  title,
  meta,
  done,
  right,
}: {
  to: string;
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  done?: boolean;
  right?: ReactNode;
}) {
  return (
    <li>
      <Link to={to} className={`list-item${done ? ' done' : ''}`}>
        {icon}
        <div className="grow">
          <div className="title">{title}</div>
          {meta && <div className="meta">{meta}</div>}
        </div>
        {right}
      </Link>
    </li>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
