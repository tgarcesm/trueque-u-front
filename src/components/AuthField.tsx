import type { ReactNode } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
};

export default function AuthField({ id, label, icon, children }: AuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

const iconClass = "h-[1.125rem] w-[1.125rem]";

export const AuthIcons = {
  user: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  email: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  lock: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  school: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-6-3l6 3 6-3" />
    </svg>
  ),
};

export const AUTH_INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 shadow-sm outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-60";
