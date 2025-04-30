import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { CarFront, Heart, Layout, ArrowLeft } from 'lucide-react';
import { checkUser } from '@/lib/checkUser';
const Header = async ({ isAdminPage = false }) => {
  //the user checkuser that we created in the lib folder
  //everytime this will check whether the user is inside the data base or not if not it will create a user
  const user = await checkUser();
  const isAdmin = user?.role === 'ADMIN';
  return (
    // background color is white with 80% oppacity
    // backdrop-blur-md means while scrolling throught the header the background will be blur
    <header className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'>
      <nav className='mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href={isAdminPage ? '/admin' : '/'} className='flex'>
          <Image
            src={'/logo.png'}
            alt='vehicle logo'
            width={200}
            height={60}
            className='h-12 w-auto object-contain'
          />
          {isAdminPage && (
            <span className='text-xs font-extralight'>admin</span>
          )}
        </Link>

        <div className='flex items-center space-x-4'>
          {isAdminPage ? (
            <>
              <Link href='/'>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 cursor-pointer'
                >
                  {/* this icon comes along with shadcn ui */}
                  <ArrowLeft size={18} />
                  <span className='hidden md:inline'>Back To App</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* if the user signed in show what is inside of this */}
              <SignedIn>
                <Link href='/saved-cars'>
                  <Button className='cursor-pointer'>
                    {/* this icon comes along with shadcn ui */}
                    <Heart size={18} />
                    <span className='hidden md:inline'>Saved Cars</span>
                  </Button>
                </Link>
                {!isAdmin ? (
                  <Link href='/reservations'>
                    <Button variant='outline' className='cursor-pointer'>
                      {/* this icon comes along with shadcn ui */}
                      <CarFront size={18} />
                      <span className='hidden md:inline'>My Reservation</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href='/admin'>
                    <Button variant='outline' className='cursor-pointer'>
                      {/* this icon comes along with shadcn ui */}
                      <Layout size={18} />
                      <span className='hidden md:inline'>Admin Portal</span>
                    </Button>
                  </Link>
                )}
              </SignedIn>
            </>
          )}

          {/* if the user is signed out we need to show the signin button */}
          <SignedOut>
            <SignInButton forceRedirectUrl='/'>
              <Button variant='outline'>Login</Button>
            </SignInButton>
          </SignedOut>

          {/* signin need to show the user icon */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
