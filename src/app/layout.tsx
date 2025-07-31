'use client'; // Required for Context Providers

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AdminProvider } from '@/context/AdminContext'; // Import AdminProvider

// Metadata can be exported from a Client Component in Next.js 13+
// but it's often simpler to keep it in a server component if needed separately.
// For now, we'll remove the `metadata` export as it's not strictly necessary for a client component.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AIDocHub</title>
        <meta name="description" content="Centralize your technical knowledge on AI and development tools." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <AdminProvider> {/* Wrap the application with AdminProvider */}
          {children}
          <Toaster />
        </AdminProvider>
      </body>
    </html>
  );
}
