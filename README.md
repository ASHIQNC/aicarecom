## Backend

for the backend we are using posgress sql data base called as supabase

1. create and account using github
2. create a project ->copy the password
3. click on the connect icon at the top. we can see different method to connect the database
4. From that tab fo to ORMs section .Choose prisma
   Prisma example :

5. copy the thingsand paste the link in .env file

# Connect to Supabase via connection pooling.

DATABASE_URL="postgresql://postgres.
----------------------"paste the password here"
rbapsxiqyeuwuqvqdipc:"Ashi1995"@@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations.

DIRECT_URL="postgresql://postgres.rbapsxiqyeuwuqvqdipc:Ashi1995@@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

---

NOTE: If we forget to copy the password use this method
database password:Ashi1995@
note:To change the databse password .
vehiclnew
Ashiqrahman1995@-new password

1.  go to settings of the website
2.  click on database
3.  reset password

NOTE: we wiill be using supabase bucket to store image

What is Prisma in PostgreSQL?
Prisma is an open-source ORM (Object-Relational Mapping) tool that helps developers interact with databases like PostgreSQL in a simple and efficient way. It acts as a bridge between your application and the database, making database queries easier and more readable.

Why Use Prisma with PostgreSQL?

1.  Simplifies Database Queries

    - Instead of writing complex SQL queries, you use Prisma’s query syntax, which is cleaner and easier to understand.

    Example: Instead of

        - SELECT * FROM users WHERE email = 'example@email.com';

You can write this in Prisma:
const user = await prisma.user.findUnique({
where: { email: "example@email.com" },
});

2. Type Safety & Autocomplete

   - If you're using TypeScript, Prisma provides auto-complete suggestions and type safety.

   - This reduces the chances of errors in queries.

3. Database Migrations Made Easy

   - Prisma automatically generates migration files when you change your database schema.

   - You can apply changes with a simple command:

     "npx prisma migrate dev --name init"

4. Works Well with APIs

   - Works perfectly with REST APIs (Express, Fastify, etc.) and GraphQL.

steps for prisma

1.

Link: https://supabase.com/
NOTE:

Step2.
we will be using images so we need to store that image for that we will be using supabase "BUCKET"

1. go to storage
2. create a bucket
3. After creating the bucket click on the connect button at the top 4. For making the storage bucket call(images) we need supabase bucket code
4. click connect -> App Framework -> click- utils/supabase/server.ts
5. copy that and create a js file the util(eg:supabase.js) and passte the code

code:
------------------------------start-------------------------------

import { createServerClient } from '@supabase/ssr';

//this file is for getting the image from the supabase bucket
export const createClient = (cookieStore) => {
return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
{
cookies: {
getAll() {
return cookieStore.getAll();
},
setAll(cookiesToSet) {
try {
cookiesToSet.forEach(({ name, value, options }) =>
cookieStore.set(name, value, options)
);
} catch {
// The `setAll` method was called from a Server Component.
// This can be ignored if you have middleware refreshing
// user sessions.
}
},
},
}
);
};

------------------------end-------------------------------------------------------

NOT: Also install the npm package : npm i @supabase/supabase-js -legacy-peer-deps(not needed) ,npm i @supabase/ssr -legacy-peer-deps 6. On the bucket create a new policies
this policies is for allowing user to upload the images
policies ->createpolicies ->click on for full customisation -> selct the allowed operation that we needed
->give description ->review->savepoliceis

## For the security of the website we are using "Arcjet"

Link: https://arcjet.com/?ref=roadsidecoder-2025-03
1.Login with google
2.create a new site
3.Copy the API key and past in the env file

## ARCJET

------------------------------------------start---------------------------

Arcjet is a security and performance middleware designed to protect modern web applications by sitting between your app and the outside world. It's often used in Node.js or Next.js apps, especially those using middleware-based routing like in Vercel or Next.js 13+ app directory.

🔐 Primary Uses of Arcjet
Rate Limiting
Prevent abuse by limiting how many requests a client can make within a time window.

Bot Protection
Detects and blocks suspicious automated traffic while allowing legitimate users.

Threat Detection
Identifies malicious patterns (e.g., SQL injection, path traversal) and blocks them in real-time.

IP Reputation & Geo-blocking
Block or allow traffic based on IP address characteristics or geographic location.

Performance Analytics (optional)
Monitor and analyze traffic patterns to optimize your infrastructure.
------------------------------------------End---------------------------

## Styling

we are using shadcn
Link: https://ui.shadcn.com/docs/installation/next

## Authentication

we are using CLERK

1. create an account in clerk.
2. create an applictaion in the clerk account(you can configure what type of authentication you want)

   Note: install the clerk npm install @clerk/nextjs

3. Copy both this keys in the configure section of project and paste in the env file
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
   CLERK_SECRET_KEY

4. create a middleware.ts file and add the necessary code.

5. Use the component of clerk such as signup ,signout etc. in any of your component.check doc for getting proper componentname

6. After that you can see the steps and installation process we need to do and follow those steps

note: check my mediumfile for more details
Link: https://medium.com/@ashiqrahman55/how-to-add-authentication-to-your-next-js-app-with-clerk-a-step-by-step-guide-fcba9221c3a2

Link: https://clerk.com/?utm_source=roadside-coder&utm_medium=youtube&utm_campaign=ai-car-marketplace&dub_id=X5ZNPT9K5DHVkBiP

-----------------------------start-------------------------------------------
NOTE: If we want to create custome route inside our clerk.follow the steps

1. go to env file and define two things

   # use custom signup and signin

   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

   this will basically tells the clerk that this is the place where we can find the sign in and sign up

2.To make the path work inside the app folder we need to create (auth) folder like the same
this (auth ) is given in parenthisis because we dont need to show the url like auth/sign-in
that is the reason why we give auth inside the parenthesis

3.  inside the (auth) folder create a sign-in folder like this [[...sign-in]] this is called " optional catch-all segments "

4.  inside that create a page.tsx file

         import { SignIn } from '@clerk/nextjs';

    import React from 'react';

const SignInPage = () => {
return (

<div>
<SignIn />
</div>
);
};

export default SignInPage;

NOTE: rest everything will be handled by clerk . we only need to create a page.tsx file inside tha optional route
NOTE: same way do it for sign-up as well

-----------------------------End--------------------------------------------------

## CREATE (is an ai website for creating websites and component)

NOTE:

## Create is a new AI creative tool that lets anyone build with natural language. You can use it to build sites and web apps. Create uses AI to turn your instructions into apps built in code.

Link:
https://www.create.xyz/

Here we are creating a waitlist for our app(waitlist means nammal app build cheyynnaa samayath if user want to add there
email and they will get notified when the app is created .justlike news letter)

1.  Login to the website
2.  click on the new Project/we can use their ai templates
3.  click on ai template ->choose wiatlist
4.  custamise template
    5.type in the promt what we needed(example:
5.  I want to create a waitlist form for my car market place called vehql
6.  after adding the answer for the question we will get the wailist component )
7.  If we added the email and send it will send the email details to the database of waitlist.You can see the email in the
    dtabase ssection
8.  we can integrate with this inside our app we can use the code. or we can click on "Embeded project" and use
    the "iframe" in our project
9.  Paste the the iframe code
10. Go to nextjs config file ->
    NOTE: paste this
    async headers() {
    return [
    {
    source: "/embed",
    headers: [
    {
    key: "Content-Security-Policy",
    value: "frame-src 'self' https://roadsidecoder.created.app;",
    },
    ],
    },
    ];
    },

link: https://aicarecom.vercel.app/admin/test-drives
