//we need to create a server action file
//that is we also need to check whether the user is admin or not. if the user is admin we need to send the user to admin pannel
// if the user is not admin they need to send the user pannel/website/ notfound page
import { getAdmin } from '@/actions/admin';
import Header from '@/components/header';
import { notFound } from 'next/navigation';
import React from 'react';
import SideBar from './_component/Sidebar/sidebar';

const AdminLayout = async ({ children }) => {
  //server component aaayond nammalkkk egene vilikka.
  //if we are using client component we need to use "useEffect"
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }
  return (
    <div>
      <Header isAdminPage={true} />
      {/* sidebar */}
      {/* inset-y-0: Set both the top and bottom inset (i.e., vertical position) to 0 */}
      <div className='flex h-full top-20 flex-col w-56 fixed z-50 inset-y-0'>
        <SideBar />
      </div>
      {/* main content */}
      <main className='md:pl-56 pt-[80px] h-full'>{children}</main>
    </div>
  );
};

export default AdminLayout;
