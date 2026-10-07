import React from 'react';
import { SectionRegistry } from './SectionRegistry';

interface SectionDispatcherProps {
  section: {
    id: string;
    type: string;
    content: any;
    customCss?: string | null;
  };
}

export function SectionDispatcher({ section }: SectionDispatcherProps) {
  const Component = SectionRegistry[section.type];

  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="universal-container my-4 p-4 border border-dashed border-red-500 bg-red-50 text-red-600 rounded-[var(--radius)]">
          Missing Registry Component for Type: <strong>{section.type}</strong>
        </div>
      );
    }
    return null;
  }

  return (
    <section id={`section-${section.id}`} className="w-full relative overflow-hidden">
      {section.customCss && (
        <style dangerouslySetInnerHTML={{ __html: section.customCss }} />
      )}
      <Component {...section.content} sectionId={section.id} />
    </section>
  );
}
