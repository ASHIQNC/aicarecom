'use server';

import { serializeCarData } from '@/lib/helper';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

//getting all the cars
//this will only return the filter with respect to the cars in data base

export async function getCarFilters() {
  //we need to get the filter seperatly exmpple make,price,bodytype etc

  try {
    // Get unique makes
    const makes = await db?.car?.findMany({
      where: { status: 'AVAILABLE' },
      //    return only the make
      select: { make: true },
      //only provide distinct make
      //dont provide duplicate make that is if we have toyota car two times we ddont need that we onlt need  1 value
      distinct: ['make'],
      orderBy: { make: 'asc' },
    });

    // Get unique body types
    const bodyTypes = await db.car.findMany({
      where: { status: 'AVAILABLE' },
      select: { bodyType: true },
      distinct: ['bodyType'],
      orderBy: { bodyType: 'asc' },
    });

    // Get unique fuel types
    const fuelTypes = await db.car.findMany({
      where: { status: 'AVAILABLE' },
      select: { fuelType: true },
      distinct: ['fuelType'],
      orderBy: { fuelType: 'asc' },
    });

    // Get unique transmissions
    const transmissions = await db.car.findMany({
      where: { status: 'AVAILABLE' },
      select: { transmission: true },
      distinct: ['transmission'],
      orderBy: { transmission: 'asc' },
    });

    // Get min and max prices using Prisma aggregations
    //we are using .aggregate function to get the data
    const priceAggregations = await db.car.aggregate({
      where: { status: 'AVAILABLE' },
      _min: { price: true },
      _max: { price: true },
    });

    //after fetching the value we need to return the value
    return {
      success: true,
      data: {
        makes: makes?.map((item) => item.make),
        bodyTypes: bodyTypes?.map((item) => item.bodyType),
        fuelTypes: fuelTypes?.map((item) => item.fuelType),
        transmissions: transmissions?.map((item) => item.transmission),
        priceRange: {
          min: priceAggregations?._min.price
            ? parseFloat(priceAggregations._min.price.toString())
            : 0,
          max: priceAggregations?._max.price
            ? parseFloat(priceAggregations._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    throw new Error('Error fetching the car filter' + error.message);
  }
}

// with respect to the filters we will be fetching the cars
// we will be passing all this filters in the function

export async function getCars({
  search = '',
  make = '',
  bodyType = '',
  fuelType = '',
  transmission = '',
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = 'newest', // Options: newest, priceAsc, priceDesc
  page = 1,
  //   this is for our pagination
  limit = 6,
}) {
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

    //fetch the available cars
    let where = {
      status: 'AVAILABLE',
    };

    //  if there is any search present we will be cheking the make,model and description for getting theh data

    if (search) {
      // we are puting the or condition that is either of this can be true
      //mode:means it can be small or capital
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    //then check individual conditions that is the filters
    if (make) {
      where.make = { equals: make, mode: 'insensitive' };
    }
    if (bodyType) {
      where.bodyType = { equals: bodyType, mode: 'insensitive' };
    }
    if (fuelType) {
      where.fuelType = { equals: fuelType, mode: 'insensitive' };
    }
    if (transmission) {
      where.transmission = { equals: transmission, mode: 'insensitive' };
    }

    //also we need to compire the pricing as well
    where.price = {
      // gte:means greater than or equals
      // we can check the prisma documentation
      gte: parseFloat(minPrice) || 0,
    };

    //also chechk of maxprice as well
    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }

    //conditon for calculating the page
    //we will start from zero
    // calculate the pagination
    // skip value is passed to skip the already fetch details
    // Example	page	limit	skip
    // Page 1	1	6	0
    // Page 2	2	6	6
    // Page 3	3	6	12
    // This skip value is passed to the database query to skip over already fetched records.

    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case 'priceAsc':
        orderBy = { price: 'asc' };
        break;
      case 'priceDesc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get total count for pagination
    const totalCars = await db?.car?.count({ where });

    // then exicute the main query
    //add all the condition we have declare above for fetching the data
    const cars = await db.car.findMany({
      where,
      take: limit,
      //we need to skip the resulted cars accordingly
      skip,
      orderBy,
    });

    //also if the user is loggedin we need to fetch the wishlisted cars

    let wishlisted = new Set();
    // if dbUser is present fetch the savedcars

    if (dbUser) {
      //userSavedCar:this is the collection that we created in the database
      const savedCars = await db.userSavedCar.findMany({
        where: { userId: dbUser.id },
        // select all the carId of the perticular user over the wishlisted id
        select: { carId: true },
      });
      // A "Set" is a special JavaScript object that only stores unique values.
      //the set will remove any duplicate id's(ie )
      wishlisted = new Set(savedCars.map((saved) => saved.carId));

      // Serialize and check wishlist status
      //we are serialising the data and check whether the wishlisted has the car.id or not
      //if it is yes we will get the data along with the wishlisted is true
      const serializedCars = cars.map((car) =>
        serializeCarData(car, wishlisted.has(car.id))
      );
      console.log('serialised', serializedCars);
      return {
        success: true,
        data: serializedCars,
        pagination: {
          total: totalCars,
          page,
          limit,
          //how many pages are there
          pages: Math.ceil(totalCars / limit),
        },
      };
    }
  } catch (error) {
    throw new Error('Error fetching the cars:' + error.message);
  }
}

//if we want to save any cars or remove any cars
export async function toggleSavedCars(carId) {
  //check whether the user is loggedin or not

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

    //check whether the car existor not
    //that is wishlisted or not
    const car = await db.car.findUnique({
      // check whether id equals provided car id
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: 'car does not exist',
      };
    }

    //chekc whether car already savedd in database (it already wishlisted)

    // Check if car is already saved
    const existingSave = await db.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    //   if saved, remove the entry from data

    // If car is already saved, remove it
    if (existingSave) {
      await db.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      revalidatePath('/saved-cars');
      return {
        success: true,
        saved: false,
        message: 'car removed from favorites',
      };
    }

    //if car is not saved we nneeed to create inside the data base
    // that is add to the wishlist

    // If car is not saved, add it
    await db.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    revalidatePath(`/saved-cars`);

    return {
      success: true,
      saved: true,
      message: 'Car added to favorites',
    };
  } catch (error) {
    throw new Error('Error toggling the saved car:' + error.message);
  }
}

//fetch saved cars that is wishlist cars
export async function getSavedCars(params) {
  //who ever the logged in user is we are getting saved cars for that user
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    //finding the saved car from the user
    const savedCars = await db.userSavedCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    // we are serialising the data
    const cars = savedCars.map((saved) => serializeCarData(saved.car));

    return {
      success: true,
      data: cars,
    };
  } catch (error) {
    console.error('Error fetching saved cars', error);

    return {
      success: false,
      error: error.message,
    };
  }
}
