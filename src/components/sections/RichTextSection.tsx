export default function RichTextSection({ content = '' }: { content?: string }) {
  return (
    <div className="section-spacing universal-container">
      <div 
        className="prose dark:prose-invert max-w-4xl mx-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
