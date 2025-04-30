'use client';
import { cancelTestDrive } from '@/actions/test-drive';
import TestDriveCard from '@/components/test-drive-card';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const ReservationList = ({ initialData }) => {
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  //we will be able to cancel  testdrive
  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

  //  there should be two types of booking that is upcoming and pastbooking.we are actually grouping those bookig
  // Group bookings by status
  //  here we will filter our data which is pending and confirmed
  const upcomingBookings = initialData?.data?.filter((booking) =>
    ['PENDING', 'CONFIRMED'].includes(booking.status)
  );

  //   here we will filter our data  "COMPLETED", "CANCELLED", "NO_SHOW"
  const pastBookings = initialData?.data?.filter((booking) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)
  );

  //if user does not have any type of reservation we are showing a fallback message
  // No reservations
  if (initialData?.data?.length === 0) {
    return (
      <div className='min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50'>
        <div className='bg-gray-100 p-4 rounded-full mb-4'>
          <Calendar className='h-8 w-8 text-gray-500' />
        </div>
        <h3 className='text-lg font-medium mb-2'>No Reservations Found</h3>
        <p className='text-gray-500 mb-6 max-w-md'>
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant='default' asChild>
          <Link href='/cars'>Browse Cars</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold mb-4'>Upcoming Test Drives</h1>
        {upcomingBookings.length === 0 ? (
          <p className='text-gray-500 italic'>No upcoming test drives</p>
        ) : (
          <div className='space-y-3'>
            {/* we are looping through the booking because there will be more booking */}
            {upcomingBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
              />
            ))}
          </div>
        )}
      </div>

      {/* pastbooking */}
      {/* we are showing old booking details */}

      {pastBookings.length > 0 && (
        <div>
          <h2 className='text-2xl font-bold mb-4'>Past Test Drives</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {pastBookings?.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
