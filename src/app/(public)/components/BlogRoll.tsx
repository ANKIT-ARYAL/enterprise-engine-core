import { getCachedPosts } from '@/lib/db/queries';
import Link from 'next/link';

export default async function BlogRollSection({ 
  title = 'Latest Posts',
  subtitle
}: { 
  title?: string;
  subtitle?: string;
}) {
  const posts = await getCachedPosts(6);

  return (
    <div className="section-spacing universal-container">
      <div className="text-center max-w-3xl mx-auto mb-12">
        {subtitle && <span className="text-[color:var(--accent)] font-bold tracking-wider uppercase text-sm block mb-3">{subtitle}</span>}
        <h2 className="h2-title mb-4">{title}</h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-[color:var(--text-muted)] italic">No articles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="p-6 border border-[color:var(--card-border)] bg-[color:var(--bg-main)] rounded-[var(--card-radius)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-[color:var(--accent)] block mb-2">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <h3 className="h3-title text-xl mb-3 line-clamp-2">{post.title}</h3>
                <p className="desc-text line-clamp-3 mb-6 text-sm">{post.excerpt || post.content}</p>
              </div>
              <div className="pt-4 border-t border-[color:var(--card-border)] flex items-center justify-between text-xs text-[color:var(--text-muted)]">
                <span>By {post.author?.name || 'Editorial Team'}</span>
                <span className="font-bold text-[color:var(--accent)]">Read article →</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
