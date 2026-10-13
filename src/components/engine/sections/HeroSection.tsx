
import React from 'react';

export function HeroSection({ heading, subheading, imageUrl, buttons }: any) {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-[color:var(--bg-main)]">
      <h1 className="text-5xl font-extrabold mb-4 text-[color:var(--text-main)]">{heading || 'Hero Heading'}</h1>
      <p className="text-xl mb-8 text-[color:var(--text-muted)] max-w-2xl">{subheading || 'Hero Subheading'}</p>
      {imageUrl && <img src={imageUrl} alt="Hero" className="w-full max-w-4xl rounded-[var(--card-radius)] shadow-2xl mb-8" />}
      <div className="flex gap-4">
        {buttons?.map((btn: any, i: number) => (
          <a key={i} href={btn.url} className="px-6 py-3 bg-[color:var(--accent)] text-white rounded-[var(--btn-radius)] font-bold transition hover:opacity-90">
            {btn.text}
          </a>
        ))}
      </div>
    </div>
  );
}
