import '../styles/fonts.css';
import '../styles/globals.css';
import '../styles/presale.css';
import { Providers } from './providers.jsx';

export const metadata = {
  title: 'BLAZE KNIFE',
  description: 'FORGE YOUR LEGEND',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
