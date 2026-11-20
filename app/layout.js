import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Hospital Appointments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f7f9fb' }}>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
