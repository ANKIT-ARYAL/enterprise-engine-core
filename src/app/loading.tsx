export default function Loading() {
  return <div className="fixed inset-0 z-[9998] grid place-items-center bg-background/70 backdrop-blur-sm"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" role="status" aria-label="Loading" /></div>;
}
