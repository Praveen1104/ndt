import "./globals.css";

export const metadata = {
  title: "Unified Project Control Panel",
  description: "Next.js frontend communicating with a high-performance Express backend on port 5200 with dynamic local static assets tracking.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
