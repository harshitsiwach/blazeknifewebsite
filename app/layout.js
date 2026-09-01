import '../styles/fonts.css';
import '../styles/globals.css';
import '../styles/presale.css';
import { Providers } from './providers.jsx';

export const metadata = {
  title: 'BLAZE KNIFE',
  description: 'FORGE YOUR LEGEND - The ultimate memecoin on Robinhood Chain',
  icons: {
    icon: [
      { url: '/image.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/image.png',
    apple: '/image.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/image.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/image.png" type="image/png" />
        <link rel="apple-touch-icon" href="/image.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
