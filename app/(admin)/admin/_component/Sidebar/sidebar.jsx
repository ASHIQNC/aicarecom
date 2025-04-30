'use client';
import { cn } from '@/lib/utils';
import { Calendar, Car, Cog, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

// Navigation items
const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Cars',
    icon: Car,
    href: '/admin/cars',
  },
  {
    label: 'Test Drives',
    icon: Calendar,
    href: '/admin/test-drives',
  },
  {
    label: 'Settings',
    icon: Cog,
    href: '/admin/settings',
  },
];
const SideBar = () => {
  // this hook will help us to know which page we are currently
  const pathName = usePathname();
  return (
    <>
      {/* desktop side bar */}
      <div className='hidden md:flex h-full flex-col overflow-y-auto shadow-sm bg-white border-r'>
        {routes.map((route) => {
          return (
            // cn is comining from lib which will help us to render the tailwind classes conditionaly
            <Link
              className={cn(
                'flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50 h-12',
                // nammal eath pathilaaano aa path ulla side navabarile link ee style effect aakum
                //this style will indicate that this color ahas been  selected
                pathName === route.href
                  ? 'text-blue-700 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700'
                  : ''
              )}
              key={route.href}
              href={route.href}
            >
              <route.icon className='h-5 w-5' />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* mobile sidebar */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16'>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex flex-col items-center justify-center text-slate-500 text-xs font-medium transition-all',
              pathName === route.href ? 'text-blue-700' : '',
              'py-1 flex-1'
            )}
          >
            <route.icon
              className={cn(
                'h-6 w-6 mb-1',
                pathName === route.href ? 'text-blue-700' : 'text-slate-500'
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SideBar;
