export default function RichTextSection({ content = '' }: { content?: string }) {
  return (
    <div className="section-spacing universal-container">
      <div 
        className="prose dark:prose-invert max-w-none w-full"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
