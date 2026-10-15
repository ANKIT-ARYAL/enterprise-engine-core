import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'youtube';
  youtubeId?: string;
  layout?: 'left' | 'center';
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  primaryCtaText,
  primaryCtaLink,
  secondaryCtaText,
  secondaryCtaLink,
  imageUrl,
  videoUrl,
  mediaType = 'image',
  youtubeId,
  layout = 'left',
}: HeroProps) {
  const isCenter = layout === 'center';

  return (
    <div className="section-spacing universal-container">
      <div className={`flex flex-col ${isCenter ? 'items-center text-center mx-auto' : 'items-start text-left'} max-w-4xl gap-6`}>
        {badge && (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
            {badge}
          </span>
        )}

        <h1 className="h1-title tracking-tight text-balance">
          {title}
        </h1>

        <p className="desc-text max-w-2xl text-balance">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {primaryCtaText && primaryCtaLink && (
            <Link
              href={primaryCtaLink}
              className="motion-target-button btn-typography px-6 py-3.5 rounded-btn bg-[var(--primary)] text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
            >
              {primaryCtaText}
            </Link>
          )}

          {secondaryCtaText && secondaryCtaLink && (
            <Link
              href={secondaryCtaLink}
              className="motion-target-button btn-typography px-6 py-3.5 rounded-btn border border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-sm hover:bg-slate-50 transition-all"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>

        {mediaType === 'video' && videoUrl ? (
          <div className="w-full relative mt-8 aspect-[16/9] rounded-[var(--radius)] overflow-hidden border border-slate-200/60 shadow-2xl">
            <video src={videoUrl} controls playsInline preload="metadata" className="w-full h-full object-cover" />
          </div>
        ) : mediaType === 'youtube' && youtubeId ? (
          <div className="w-full relative mt-8 aspect-[16/9] rounded-[var(--radius)] overflow-hidden border border-slate-200/60 shadow-2xl">
            <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={title} allowFullScreen className="w-full h-full" />
          </div>
        ) : imageUrl ? (
          <div className="w-full relative mt-8 aspect-[16/9] rounded-[var(--radius)] overflow-hidden border border-slate-200/60 shadow-2xl">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
