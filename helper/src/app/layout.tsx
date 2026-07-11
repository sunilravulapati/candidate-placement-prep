// src/app/layout.tsx
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'PrepGenie - AI Placement Operating System',
  description: 'Elevate your interview prep with Resume AI, Mock Interviews, DSA practice, and Knowledge Hubs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased min-h-screen text-slate-100 bg-[#030712]" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}