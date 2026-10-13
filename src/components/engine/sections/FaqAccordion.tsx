
import React, { useState } from 'react';

export function FaqAccordion({ heading, faqs }: any) {
  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-[color:var(--text-main)]">{heading || 'Frequently Asked Questions'}</h2>
      <div className="space-y-4">
        {faqs?.map((faq: any, i: number) => (
          <details key={i} className="group border border-[color:var(--card-border)] rounded-[var(--card-radius)] p-4 bg-black/5">
            <summary className="font-bold cursor-pointer list-none text-[color:var(--text-main)] flex justify-between">
              {faq.question}
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-[color:var(--text-muted)]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
