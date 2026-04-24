import './globals.css';

export const metadata = {
  title: 'Time-Off Portal',
  description: 'Operational frontend for time-off requests and HCM synchronization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
