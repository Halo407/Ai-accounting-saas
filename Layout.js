import '../styles/globals.css';

export const metadata = {
  title: "AI Accounting",
  description: "Sistem akuntansi AI untuk UMKM."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </body>
    </html>
  );
}
