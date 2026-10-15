import '@/app/globals.css';
import { TokenProvider } from '@/components/engine/TokenProvider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from 'react-hot-toast';
import GlobalLoadingIndicator from '@/components/system/GlobalLoadingIndicator';

export const metadata = {
  title: 'Enterprise Engine',
  description: 'Modular High-Performance Engine',
};

// The application reads database-backed settings during rendering. Do not
// prerender the root tree before those runtime values are available.
export const instant = false;

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
          <GlobalLoadingIndicator />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
