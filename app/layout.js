import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

//using different font its not third party it comes along with nextjs
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'Vehiql',
  description: 'Find your dream vehicle',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          // this will apply whole font to project
          className={`${inter.className}`}
        >
          <Header />
          <main className='min-h-screen'>{children}</main>
          <Toaster richColors />
          <footer className='bg-blue-50 py-12'>
            {/*this is good for mobile version  */}
            <div className='container mx-auto px-4 text-center text-gray-600'>
              <p>All rights to ASR technologies</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
