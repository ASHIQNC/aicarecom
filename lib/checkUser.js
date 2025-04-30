import { currentUser } from '@clerk/nextjs/server';
import { db } from './prisma';

export const checkUser = async () => {
  // check whether user signed in or not
  const user = await currentUser();
  //    if the user is not signed in return null
  if (!user) {
    return null;
  }

  // we want to store our user in the data base
  //since we are using clerk for authentication we need to use this way to store the user
  //in the database

  try {
    //first call to db
    // check the documentation of prisma this are the build in functionality
    const loggedInUser = await db.user.findUnique({
      //we need to check clerkUserId is equal to the current user id
      //
      where: {
        clerkUserId: user.id,
      },
    });

    // if the user is inside the data base return login user
    if (loggedInUser) {
      return loggedInUser;
    }

    // if not create the user
    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return newUser;
  } catch (error) {
    console.log('error', error);
  }
};
