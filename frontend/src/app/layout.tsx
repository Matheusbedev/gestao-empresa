import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RH System — Gestão de Pessoas',
  description: 'Sistema profissional de gestão de RH, controle de ponto e folha de pagamento.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '13px', fontWeight: 600 },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 3500,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
