
import React from 'react';

export function FeaturedGrid({ heading, features }: any) {
  return (
    <div className="w-full py-16 px-4 bg-black/5">
      <h2 className="text-3xl font-bold mb-12 text-center text-[color:var(--text-main)]">{heading || 'Features'}</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features?.map((f: any, i: number) => (
          <div key={i} className="p-6 bg-[color:var(--bg-main)] border border-[color:var(--card-border)] rounded-[var(--card-radius)] text-center transition hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-[color:var(--accent)]/10 text-[color:var(--accent)] rounded-full flex items-center justify-center text-xl font-bold">{i + 1}</div>
            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-main)]">{f.title}</h3>
            <p className="text-[color:var(--text-muted)]">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
