import '../styles/fonts.css';
import '../styles/globals.css';

export const metadata = {
  title: 'BLAZE KNIFE',
  description: 'FORGE YOUR LEGEND',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
