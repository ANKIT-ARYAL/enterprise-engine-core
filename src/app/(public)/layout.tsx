import { SmoothScrollProvider } from '@/components/engine/SmoothScrollProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="public-shell">
        {/* Navbar could go here */}
        {children}
        {/* Footer could go here */}
      </div>
    </SmoothScrollProvider>
  );
}
