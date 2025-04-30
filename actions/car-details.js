import { serializeCarData } from '@/lib/helper';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getCarById(carId) {
  try {
    // Get current user if authenticated
    //check whether user is authenticated or not
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    //get the car details with the id
    const car = await db.car.findUnique({
      where: {
        id: carId,
      },
    });

    //if no car is found
    if (!car) {
      return {
        success: false,
        error: 'Car not found',
      };
    }

    //check whether the car is not wishlisted by user
    let isWishlisted = false;
    // Check if the user is logged in (i.e., dbUser exists)
    if (dbUser) {
      // Query the database to find if this specific user has saved this specific car
      const savedCar = await db.userSavedCar.findUnique({
        where: {
          // Using a composite key (userId and carId) to find a unique saved car entry
          userId_carId: {
            userId: dbUser.id, // The ID of the logged-in user
            carId, // The ID of the car being checked
          },
        },
      });

      // If a savedCar entry is found, set isWishlisted to true; otherwise, it remains false
      //double exclamation: If savedCar is not null/undefined, !!savedCar becomes true
      isWishlisted = !!savedCar;
    }

    //check whether the user has already booked testdrive
    const existingTestDrive = await db.testDriveBooking.findFirst({
      where: {
        carId,
        userId: dbUser.id,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    //if testdrive doess exist we will populate some data

    let userTestDrive = null;
    if (existingTestDrive) {
      userTestDrive = {
        id: existingTestDrive.id,
        status: existingTestDrive.status,
        bookingDate: existingTestDrive.bookingDate.toISOString(),
      };
    }

    // we will also fetch the daealer ship info for showing in the car detail page
    const dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    // return all the data we have
    return {
      success: true,
      data: {
        ...serializeCarData(car, isWishlisted),
        testDriveInfo: {
          userTestDrive,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),

                //we are taking all the workingHours and we are structure them in the below order using map
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error) {
    throw new Error('Error fetching car details:' + error.message);
  }
}
