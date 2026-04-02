import '../styles/globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Portfolio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', background: '#0b1220', color: '#e2e8f0' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
