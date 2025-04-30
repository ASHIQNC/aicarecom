'use server';

import { serializeCarData } from '@/lib/helper';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

//booking for test drive

export async function bookTestDrive({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) {
  try {
    //check whether user is authenticated or not
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error('You must be logged in to book a test drive');

    // Find user in our database
    const user = await db?.user?.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error('User not found in database');

    // Check if car exists and is available
    const car = await db?.car?.findUnique({
      where: { id: carId, status: 'AVAILABLE' },
    });

    if (!car) throw new Error('Car not available for test drive');

    //check whether the slot is already booked or not
    const existingBooking = await db.testDriveBooking.findFirst({
      where: {
        carId,
        //if booking data and start time matches we can confirm that the sloot is booked or not
        bookingDate: new Date(bookingDate),
        startTime,
        //status should be this two not confirmed
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBooking) {
      throw new Error(
        'This time slot is already booked. Please select another time.'
      );
    }

    //if not Create the booking
    const booking = await db.testDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.log('Error booking test drive:', error);

    return {
      success: false,
      error: error.message || 'Failed to booking test drive',
    };
  }
}

//fetch usertestdrive data

export async function getUserTestDrive() {
  try {
    //check whether user is authenticated or not
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error('You must be logged in to book a test drive');

    // Find user in our database
    const user = await db?.user?.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error('User not found in database');

    // Get user's test drive bookings
    const bookings = await db?.testDriveBooking.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { bookingDate: 'desc' },
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error('Error fetching test drive', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

//cancel the test drive

export async function cancelTestDrive(bookingId) {
  try {
    //check whether user is authenticated or not
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error('You must be logged in to book a test drive');

    // Find user in our database
    const user = await db?.user?.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error('User not found in database');

    //we are sending the booking id and get the data from the data base
    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    //only two people can cancel the booking that is the user who has booked the booking testdrive and the admin

    // Check if user owns this booking
    if (booking.userId !== user.id || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized to cancel this booking',
      };
    }

    // Check if booking can be cancelled
    //check whether the booking is already canceled
    if (booking.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Booking is already cancelled',
      };
    }

    //check whether the booking is already completed or not
    //if completed you cannot cancel the booking
    if (booking.status === 'COMPLETED') {
      return {
        success: false,
        error: 'Cannot cancel a completed booking',
      };
    }

    //if all the above conditon passess we can update the booking status

    // Update the booking status
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    // Revalidate paths
    revalidatePath('/reservations');
    revalidatePath('/admin/test-drives');

    return {
      success: true,
      message: 'Test drive cancelled successfully',
    };
  } catch (error) {
    console.error('Error canceling test drive:', error);

    return {
      success: false,
      error: error.message,
    };
  }
}
