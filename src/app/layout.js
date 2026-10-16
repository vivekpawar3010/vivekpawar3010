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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
