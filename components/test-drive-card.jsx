'use client';
import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { format, parseISO } from 'date-fns';
import { Card } from './ui/card';
import Image from 'next/image';
import { ArrowRight, Calendar, Car, Clock, Loader2, User } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

//we need to a formatTime helper function as well

// Helper function to format time
const formatTime = (timeString) => {
  try {
    return format(parseISO(`2022-01-01T${timeString}`), 'h:mm a');
  } catch (error) {
    return timeString;
  }
};

//we would need a badge with respect to the status
// Helper function for status badge
const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return <Badge className='bg-amber-100 text-amber-800'>Pending</Badge>;
    case 'CONFIRMED':
      return <Badge className='bg-green-100 text-green-800'>Confirmed</Badge>;
    case 'COMPLETED':
      return <Badge className='bg-blue-100 text-blue-800'>Completed</Badge>;
    case 'CANCELLED':
      return <Badge className='bg-gray-100 text-gray-800'>Cancelled</Badge>;
    case 'NO_SHOW':
      return <Badge className='bg-red-100 text-red-800'>No Show</Badge>;
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
};

const TestDriveCard = ({
  isAdmin = false,
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isCancelling = false,
  // this is a renderprop basically we are supplying a component through props
  renderStatusSelector = () => null,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;

    //if oncancel is present we will set the id and close the dialgue box
    await onCancel(booking?.id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden ${
          isPast ? 'opacity-80 hover:opacity-100 transition-opacity' : ''
        }`}
      >
        <div className='flex flex-col sm:flex-row'>
          {/* image section */}
          <div className='sm:w-1/4 relative h-40 sm:h-auto'>
            {booking?.car?.images && booking?.car?.images.length > 0 ? (
              <div className='relative w-full h-full'>
                <Image
                  src={booking?.car?.images[0]}
                  alt={`${booking?.car?.make} ${booking?.car?.model}`}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                <Car className='h-12 w-12 text-gray-400' />
              </div>
            )}

            {/* status of the car */}

            <div className='absolute top-2 right-2 sm:hidden'>
              {getStatusBadge(booking?.status)}
            </div>
          </div>

          {/* booking details */}

          <div className='p-4 sm:w-1/2 sm:flex-1'>
            {/* status badge */}
            <div className='hidden sm:block mb-2'>
              {getStatusBadge(booking?.status)}
            </div>

            {/* details of the car */}

            <h3 className='text-lg font-bold mb-1'>
              {booking?.car?.year} {booking?.car?.make} {booking?.car?.model}{' '}
            </h3>

            {/* here we will be rendering ability to change the status of the car */}
            {/* this should be available for the admin portel  */}
            {/* here we  will be rendering  prp camponent.that is component which is coming as prop*/}

            {renderStatusSelector()}

            {/* here we will be rendering the booking time start time and endtime */}
            <div className='space-y-2 my-2'>
              <div className='space-y-2 my-2'>
                <div className='flex items-center text-gray-600'>
                  <Calendar className='h-4 w-4 mr-2' />
                  {format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className='flex items-center text-gray-600'>
                  <Clock className='h-4 w-4 mr-2' />
                  {formatTime(booking.startTime)} -{' '}
                  {formatTime(booking.endTime)}
                </div>

                {/* Show customer info in admin view */}
                {/* this details only the admin can see */}
                {isAdmin && booking.user && (
                  <div className='flex items-center text-gray-600'>
                    <User className='h-4 w-4 mr-2' />
                    {booking.user.name || booking.user.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Right */}
          {/* here we will show the ability to cancel the booking and the notes if the user has provided */}
          {/* in the past booking case we dont be showing this */}
          {showActions && (
            <div className='p-4 border-t sm:border-t-0 sm:border-l sm:w-1/4 sm:flex sm:flex-col sm:justify-center sm:items-center sm:space-y-2'>
              {/* Show notes if any */}
              {booking?.notes && (
                <div className='bg-gray-50 p-2 rounded text-sm w-full'>
                  <p className='font-medium'>Notes:</p>
                  <p className='text-gray-600'>{booking.notes}</p>
                </div>
              )}

              <Button
                variant='outline'
                size='sm'
                className='w-full my-2'
                asChild
              >
                <Link
                  href={`/car/${booking.carId}`}
                  className='flex items-center justify-center'
                >
                  View Car
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              {(booking.status === 'PENDING' ||
                booking.status === 'CONFIRMED') && (
                <Button
                  variant='destructive'
                  size='sm'
                  className='w-full'
                  //on click we will open a dialgue box and ask the user if we want to cancel it or not
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    'Cancel'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* dialogue box which will allow us to cancel our booking */}
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Test Drive</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your test drive for the{' '}
                {booking?.car?.year} {booking?.car?.make} {booking?.car?.model}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {/* additional details */}

            <div className='py-4'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Date:</span>
                  <span>
                    {format(
                      new Date(booking.bookingDate),
                      'EEEE, MMMM d, yyyy'
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Time:</span>
                  <span>
                    {formatTime(booking.startTime)} -{' '}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep Reservation
              </Button>
              <Button
                variant='destructive'
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Reservation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TestDriveCard;
