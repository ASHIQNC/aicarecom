'use server';

import { serializeCarData } from '@/lib/helper';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getAdmin() {
  //first we need to check whether the user is logged in or not
  const { userId } = await auth();

  if (!userId) throw new Error('Unauthorized');

  //check the user is inside the database ornot
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  //if the user is not present or not a admin show this error
  if (!user || user.role !== 'ADMIN') {
    return { authorized: false, reason: 'not-admin' };
  }
  //if the user is present
  return { authorized: true, user };
}

//getAdminTest drive
export async function getAdminTestDrives({ search = '', status = '' }) {
  try {
    //check for the user is authorized or not
    //first we need to check whether the user is logged in or not
    const { userId } = await auth();

    if (!userId) throw new Error('Unauthorized');

    //check the user is inside the database ornot
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    //if the user is not present or not a admin show this error
    if (!user || user.role !== 'ADMIN') {
      return { authorized: false, reason: 'not-admin' };
    }

    //lets build where condition for our query

    let where = {};

    //if there is a status filter we will add it
    if (status) {
      where.status = status;
    }

    //also we will add the search as well

    // Add search filter
    //if search is there we can check either of the condition using " OR "
    //first for the car or the user
    //for the car we are checking the make and model
    //  for the user we are checking name and email
    //search can be either of this 4 things

    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    //here we will get the booking

    const booking = await db.testDriveBooking.findMany({
      //here we will add the where condition that we checked above and all other things as well
      where,
      include: {
        car: true,
        //here going isnide the user table and selecting the following values
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'asc' }],
    });

    //format all of the booking data we have

    // Format the bookings
    const formattedBookings = booking.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      userId: booking.userId,
      user: booking.user,
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
    console.error('Error fetching test drives:', error);

    return {
      success: true,
      error: error.message,
    };
  }
}

//create a server action to update the testdrive status

export async function updatetestDriveStatus(bookingId, newStatus) {
  try {
    //check for the user is authorized or not
    //first we need to check whether the user is logged in or not
    const { userId } = await auth();

    if (!userId) throw new Error('Unauthorized');

    //check the user is inside the database ornot
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    //if the user is not present or not a admin show this error
    if (!user || user.role !== 'ADMIN') {
      return { authorized: false, reason: 'not-admin' };
    }

    //  get the booking details that is the booking id
    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    //get all the status we have
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ];

    //if the status user is sending not in the above array show the error message
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: 'Invalid status',
      };
    }

    //if all this is find update the db
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    //refresh the data

    // Revalidate paths
    revalidatePath('/admin/test-drives');
    revalidatePath('/reservations');

    return {
      success: true,
      message: 'Test drive status updated successfully',
    };
  } catch (error) {
    throw new Error('Error updating test drive status:' + error.message);
  }
}

// //get the dashboard
// export async function getDashboardData() {
//   try {
//     //check for the user is authorized or not
//     //first we need to check whether the user is logged in or not
//     const { userId } = await auth();

//     if (!userId) throw new Error('Unauthorized');

//     //check the user is inside the database ornot
//     const user = await db.user.findUnique({
//       where: {
//         clerkUserId: userId,
//       },
//     });
//     //if the user is not present or not a admin show this error
//     if (!user || user.role !== 'ADMIN') {
//       return { authorized: false, reason: 'not-admin' };
//     }

//     //CAR STATISTICS"

//     //how many cars are there
//     const totalCars = await db.car.count();
//     // how many available cars are there
//     const availableCars = await db.car.count({
//       where: { status: 'AVAILABLE' },
//     });

//     //how many cars arre sold
//     const soldCars = await db.car.count({
//       where: { status: 'SOLD' },
//     });

//     //unawailable cars

//     const unavailableCars = await db.car.count({
//       where: { status: 'UNAVAILABLE' },
//     });

//     //get the fetaured cars
//     const featuredCars = await db.car.count({
//       where: { featured: true },
//     });

//     //TESTDRIVE STATISTICS

//     // Calculate test drive statistics
//     const totalTestDrives = await db.testDriveBooking.count();
//     const pendingTestDrives = await db.testDriveBooking.count({
//       where: { status: 'PENDING' },
//     });
//     const confirmedTestDrives = await db.testDriveBooking.count({
//       where: { status: 'CONFIRMED' },
//     });
//     const completedTestDrives = await db.testDriveBooking.count({
//       where: { status: 'COMPLETED' },
//     });

//     const cancelledTestDrives = await db.testDriveBooking.count({
//       where: { status: 'CANCELLED' },
//     });
//     const noShowTestDrives = await db.testDriveBooking.count({
//       where: { status: 'NO_SHOW' },
//     });

//     // Calculate test drive conversion rate
//     const completedTestDriveCarIds = await db.testDriveBooking.findMany({
//       where: { status: 'COMPLETED' },
//       select: { carId: true },
//     });

//     //sold car after testdrive
//     //ONLY WANT TO SHOW THE CAR AFTER THE TESTDRIVE
//     const soldCarsAfterTestDrive = await db.car.count({
//       where: {
//         id: { in: completedTestDriveCarIds.map((item) => item.carId) },
//         status: 'SOLD',
//       },
//     });

//     //this will give the conversion percentage

//     const conversionRate =
//       completedTestDrives > 0
//         ? (soldCarsAfterTestDrive / completedTestDrives) * 100
//         : 0;

//     //return the daata

//     return {
//       success: true,
//       data: {
//         cars: {
//           total: totalCars,
//           available: availableCars,
//           sold: soldCars,
//           unavailable: unavailableCars,
//           featured: featuredCars,
//         },
//         testDrives: {
//           total: totalTestDrives,
//           pending: pendingTestDrives,
//           confirmed: confirmedTestDrives,
//           completed: completedTestDrives,
//           cancelled: cancelledTestDrives,
//           noShow: noShowTestDrives,
//           conversionRate: parseFloat(conversionRate.toFixed(2)),
//         },
//       },
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error.message);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// }

// NOTE:The above code will work but on the above code we can see that we are making so many calls to the databas
//eventually this will lead to the slowness of the app
//so we are optimising the above code

//get the dashboard
export async function getDashboardData() {
  try {
    //check for the user is authorized or not
    //first we need to check whether the user is logged in or not
    const { userId } = await auth();

    if (!userId) throw new Error('Unauthorized');

    //check the user is inside the database ornot
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    //if the user is not present or not a admin show this error
    if (!user || user.role !== 'ADMIN') {
      return { authorized: false, reason: 'not-admin' };
    }

    //CAR STATISTICS"

    // Fetch all necessary data in a single parallel operation
    const [cars, testDrives] = await Promise.all([
      // Get all cars with minimal fields
      db.car.findMany({
        select: {
          id: true,
          status: true,
          featured: true,
        },
      }),

      // Get all test drives with minimal fields
      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
        },
      }),
    ]);

    // Calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter(
      (car) => car.status === 'AVAILABLE'
    ).length;
    const soldCars = cars.filter((car) => car.status === 'SOLD').length;
    const unavailableCars = cars.filter(
      (car) => car.status === 'UNAVAILABLE'
    ).length;
    const featuredCars = cars.filter((car) => car.featured === true).length;

    // Calculate test drive statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter(
      (td) => td.status === 'PENDING'
    ).length;
    const confirmedTestDrives = testDrives.filter(
      (td) => td.status === 'CONFIRMED'
    ).length;
    const completedTestDrives = testDrives.filter(
      (td) => td.status === 'COMPLETED'
    ).length;
    const cancelledTestDrives = testDrives.filter(
      (td) => td.status === 'CANCELLED'
    ).length;
    const noShowTestDrives = testDrives.filter(
      (td) => td.status === 'NO_SHOW'
    ).length;

    // Calculate test drive conversion rate
    const completedTestDriveCarIds = testDrives
      .filter((td) => td.status === 'COMPLETED')
      .map((td) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) =>
        car.status === 'SOLD' && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    //return the daata

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
