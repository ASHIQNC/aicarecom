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

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
