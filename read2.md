## npm i react-dropzone :

The react-dropzone package is used to create a drag-and-drop file upload feature in React apps.

Why use react-dropzone?
Easy File Upload – It lets users drag and drop files instead of clicking "Choose File."

Customizable – You can control accepted file types (e.g., only images, PDFs, etc.).

Better User Experience – Drag-and-drop feels modern and smooth.

Handles Multiple Files – Users can upload multiple files at once.

Lightweight & Simple – It’s easy to integrate into any React project.

## DATABASE DESIGN

## For designing schema or model for the database we are using PRISMA.PRISMa is a mediator which helps us to connect with database

## here we are using POSTGRESQL data base

"npm i -D prisma" (D is the dev dependencies)

1. to initialise prisma we can type : npx prisma init
   NOTE: inside the schema.prisma file add the "directURL" and "dataBAse URl"

2. after initialising you will get a prisma folder inside that add the model /schema that need to be
   added in the data base .also the add the database url and for supabase we have directurl as well

NOTE: Add the schema inside the schema.prisma file 1h:50

3. after creating the schema we needd to add this in the supabase database . for that,
   "npx prisma migrate dev --name create-models"
4. if you get any error install the dependecies as well (try again multiple times)

//if there is any error comes install something install that as well

5. to check whether the table has been created or not go to the supabase ->select the project
   ->table editor ->You can see the table that we have created

6. After that go to lib folder and create prisma instance
   ->if we want communicate with the data base we need to create a prisma instance.tthat is call to the database

-----------------start----------------

//if we want communicate with the data base we need to create a prisma instance.
//tthat is call to the database

import { PrismaClient } from '@prisma/client';

//every time our app reload this will create a new instance of prisma client
//globalThis akath value indo?indenkil aaa value edukka ellanki create a new instance
export const db = globalThis.prisma || new PrismaClient();

//if this is not in production tha db will be assign to a global variable
if (process.env.NODE_ENV !== 'production') {
globalThis.prisma = db;
}

-------------end--------------------------------------------------------------------

NOTe: we need to add user in the prisma data base for authenticationg our api calls

1. inside the lib folder create checkUSer.jsx file and inside that add the following code

---------------------start--------------------------------------------------------

//this is for storing user inside the database

import { currentUser } from '@clerk/nextjs/server';
import { db } from './prisma';

export const checkUser = async () => {
// check whether user signed in or not
const user = await currentUser();
// if the user is not signed in return null
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

---------------end------------------------------------------------------------------

## vercel deploymenr

1. login to vercel using github
2. import the project that we need to deploy
3. on the install command section type
   " npm install --legacy-peer-deps"
4. Add all the environment variable in the environmental variable section
