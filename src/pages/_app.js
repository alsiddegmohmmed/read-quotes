import '@/styles/globals.css';
import { Inter, Literata } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${literata.variable} app-shell`}>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </div>
  );
}
