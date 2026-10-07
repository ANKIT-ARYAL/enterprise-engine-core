import '@/app/globals.css';
import { TokenProvider } from '@/components/engine/TokenProvider';

export const metadata = {
  title: 'Enterprise Engine',
  description: 'Modular High-Performance Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* TokenProvider streams dynamic variables immediately to block FOUC */}
        <TokenProvider />
      </head>
      <body>{children}</body>
    </html>
  );
}
