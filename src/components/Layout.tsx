import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh flex flex-col bg-green-black text-off-white">
      <header className="border-b border-dark-grey px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-semibold text-green-black text-sm">
            DD
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg leading-none tracking-tight">
              Decade Draft
            </p>
            <p className="text-[11px] text-grey uppercase tracking-widest mt-0.5">
              Historical Stock Simulator
            </p>
          </div>
        </div>
        <span className="text-xs text-grey/80 hidden sm:block">Data: Yahoo Finance</span>
      </header>

      <div className="overflow-hidden border-b border-dark-grey/50 bg-pure-black/30 py-2">
        <div className="animate-ticker whitespace-nowrap text-xs text-accent/80 flex gap-8">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="inline-flex gap-8">
              <span>WMT 1970s +1,027,350%</span>
              <span>NVDA 2020s +2,400%</span>
              <span>BRK-B beats S&P</span>
              <span>Can you draft better than the index?</span>
              <span>$10K per decade | $50K total | blind draft</span>
            </span>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="border-t border-dark-grey px-4 py-4 text-center text-xs text-grey/70">
        Decade Draft is an independent project for entertainment and education. Not financial advice.
        <br />
        Past performance does not guarantee future results. Data via Yahoo Finance (dividend-adjusted).
      </footer>
    </div>
  );
}
