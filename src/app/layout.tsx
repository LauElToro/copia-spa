import { Inter } from 'next/font/google'
import { Providers } from './providers';
import { SpaTokenPreloader } from './SpaTokenPreloader';
import './globals.css';

const inter = Inter({ subsets: ['latin'], preload: false })

export const metadata = {
  title: 'Liberty Club',
  description: 'Únete y vende sin intermediarios en nuestra plataforma descentralizada.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SpaTokenPreloader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
