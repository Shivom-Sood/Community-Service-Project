import { Logo } from './ui'
import { ThemeToggle } from './Theme'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-6 shadow-xl shadow-brand-600/5 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
  )
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {props.children ?? <input className="input" {...props} />}
    </label>
  )
}
