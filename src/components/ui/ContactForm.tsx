/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCachedSystemSettings } from '@/lib/db/queries';
import { DynamicFormRenderer } from '@/components/ui/DynamicFormRenderer';

export async function ContactForm() {
  const settings = await getCachedSystemSettings();
  const tokens = (settings?.tokens as any) || {};
  
  const schema = tokens.formSchema;

  if (!schema || !schema.fields || schema.fields.length === 0) {
    return (
      <div className="p-8 text-center bg-black/5 rounded-[var(--card-radius)] border border-[color:var(--card-border)] text-[color:var(--text-main)]">
        <p className="opacity-70">No dynamic form configured yet. Please configure it in the Admin Settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <DynamicFormRenderer schema={schema} onSubmit={async (data) => console.log(data)} />
    </div>
  );
}
