import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Interactive3DBackground from '../components/Interactive3DBackground';

export const metadata = {
  title: {
    default: 'Vivek Pawar | Full-Stack Developer & Android Developer',
    template: '%s | Vivek Pawar',
  },
  description:
    'Portfolio and live analytics hub for Vivek Pawar. Final-year CSE student building scalable web apps, Android apps, and competitive programming solutions.',
  keywords: [
    'Vivek Pawar',
    'Full Stack Developer',
    'Android Developer',
    'React',
    'Next.js',
    'LeetCode',
    'GitHub Analytics',
    'Java',
    'Pandharpur',
  ],
  authors: [{ name: 'Vivek Pawar', url: 'https://github.com/vivekpawar3010' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio_theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          position: 'relative',
        }}
      >
        <Interactive3DBackground />
        <Navbar />
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
