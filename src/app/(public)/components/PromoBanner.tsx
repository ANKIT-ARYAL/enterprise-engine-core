export default function PromoBannerSection({ text = 'Promo' }: { text?: string }) {
  return (
    <div className="w-full bg-[var(--accent)] text-white py-4 text-center">
      <p className="font-semibold">{text}</p>
    </div>
  );
}
