//this is the place we write for the admin related car page
'use server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Get dealership info with working hours
export async function getDealershipInfo() {
  try {
    //first add the condition if the user is authorized or not

    //first we need to check whether the user is logged in or not
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    //check the user in the db as well
    //check the user is inside the database ornot
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error('User not found');

    //get the dealership info
    let dealership = await db.dealershipInfo.findFirst({
      //include working hours and order will be ascending order
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    //if there is no dealer ship add below data data
    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          // Default values will be used from schema
          workingHours: {
            create: [
              {
                dayOfWeek: 'MONDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'TUESDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'WEDNESDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'THURSDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'FRIDAY',
                openTime: '09:00',
                closeTime: '18:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'SATURDAY',
                openTime: '10:00',
                closeTime: '16:00',
                isOpen: true,
              },
              {
                dayOfWeek: 'SUNDAY',
                openTime: '10:00',
                closeTime: '16:00',
                isOpen: false,
              },
            ],
          },
        },
        //include working hours and order will be ascending order
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
        },
      });
    }

    // Format the data
    console.log('dealer', dealership);
    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.log('error', error.message);
    throw new Error('Error fetching dealership info:' + error.message);
  }
}

// save working hours
export async function saveWorkingHours(workingHours) {
  try {
    //first we need to check whether the user is logged in or not
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    //check the user in the db as well
    //check the user is inside the database ornot
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    //check whether the user is admin or not
    if (!user && user.role !== 'ADMIN')
      throw new Error('Unauthorized: Admin access required');

    //fetch the dealership info
    const dealerShip = await db.dealershipInfo.findFirst();
    if (!dealerShip) {
      throw new Error('DealerShip info not found');
    }

    //for updating dealershipinfo first we need to delete existing dealership info
    // Update working hours - first delete existing hours
    await db.workingHour.deleteMany({
      where: { dealershipId: dealerShip.id },
    });

    //create the new working Hours
    //example nammle nerther dummy data koduthillee ath change aakaor working hours change indel ee api vech set aakam
    for (const hour of workingHours) {
      await db.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealerShip.id,
        },
      });
    }

    // Revalidate paths
    revalidatePath('/admin/settings');
    revalidatePath('/'); // Homepage might display hours

    return {
      success: true,
    };
  } catch (error) {
    throw new Error('Error saving working hours:' + error.message);
  }
}

// Get all users
export async function getUsers() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get all users
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log('users', users);

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.log('errorsssss', error.message);
    throw new Error('Error fetching users:' + error.message);
  }
}

// Update user role
//take the user id and role
export async function updateUserRole(userId, role) {
  try {
    //changed the name from userid to adminid
    const { userId: adminId } = await auth();
    if (!adminId) throw new Error('Unauthorized');

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: adminId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Update user role
    //this update function and all above db functionality are from prisma
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate paths
    revalidatePath('/admin/settings');

    return {
      success: true,
    };
  } catch (error) {
    throw new Error('Error updating user role:' + error.message);
  }
}
