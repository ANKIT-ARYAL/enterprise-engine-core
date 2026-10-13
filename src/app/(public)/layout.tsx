import { SmoothScrollProvider } from '@/components/engine/SmoothScrollProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="public-shell min-h-screen flex flex-col bg-[color:var(--bg-body)] text-[color:var(--text-main)]">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
