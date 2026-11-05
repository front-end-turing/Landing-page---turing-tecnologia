import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});
export const metadata = {
  title: 'Turing Tecnologia',
  icons: {
    icon: { url: '/images/logo-gradiente.png', type: 'image/png' },
  },
  description:
    'Empresa Júnior de Tecnologia da UFERSA Angicos. Desenvolvemos sites, softwares e consultoria, enquanto formamos futuros profissionais do semiárido potiguar.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
