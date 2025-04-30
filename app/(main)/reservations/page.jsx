import { getUserTestDrive } from '@/actions/test-drive';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import ReservationList from './_components/reservation-list';

export const metadata = {
  title: 'My Reservations | Vehiql',
  description: 'Manage your test drive reservations',
};

const ReservationPage = async () => {
  // check whether user is logged in or not
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?/redirect=/reservation');
  }

  // Fetch reservations on the server
  const reservationsResult = await getUserTestDrive();
  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-5xl md:text-6xl mb-6 gradient-title'>
        Your Reservations
      </h1>
      <ReservationList initialData={reservationsResult} />
    </div>
  );
};

export default ReservationPage;
