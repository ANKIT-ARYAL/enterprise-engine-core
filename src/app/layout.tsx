import '@/app/globals.css';
import { TokenProvider } from '@/components/engine/TokenProvider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from 'react-hot-toast';

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
      <body>
        <ThemeProvider>
          <Toaster position="bottom-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
