import type { ReactNode } from "react";

type ScreeningCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ScreeningCard({ title, subtitle, children }: ScreeningCardProps) {
  return (
    <section className="dash-card mx-auto w-full max-w-4xl p-6 sm:p-8">
      <div className="section-label">Screening Funnel</div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}
