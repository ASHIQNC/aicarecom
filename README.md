## Backend

for the backend we are using posgress sql data base called as supabase
1.create and account using github
2create a project 3. click on the connect icon at the top. we can see different method to connect the database 4. From that tab fo to ORMs section .Choose prisma
Prisma example :

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

Link: https://supabase.com/
NOTE:

database password:Ashi1995@
note:To change the databse password . 1. go to settings of the website 2. click on database 3. reset password

Step2.
we will be using images so we need to store that image for that we will be using supabase "BUCKET"
1 .go to storage
2.create a bucket
3.After creating the bucket click on the connect button at the top 4. For making the storage bucket call(images) we need supabase bucket code
5.click connect -> App Framework -> click- utils/supabase/server.ts
6.copy that and create a js file the util(eg:supabase.js) and passte the code
NOT: Also install the npm package : npm i @supabase/supabase-js -legacy-peer-deps(not needed) ,npm i @supabase/ssr -legacy-peer-deps 7. On the bucket create 7. a new policies
this policies is for allowing user to upload the images
policies ->createpolicies ->click on for full customisation -> selct the allowed operation that we needed
->give description ->review->savepoliceis

## Styling

we are using shadcn
Link: https://ui.shadcn.com/docs/installation/next

## Authentication

we are using CLERK
1.create an account in clerk.
2.create an applictaion in the clerk account(you can configure what type of authentication you want) 3. After that you can see the steps and installation process we need to do and follow those steps

Link: https://clerk.com/?utm_source=roadside-coder&utm_medium=youtube&utm_campaign=ai-car-marketplace&dub_id=X5ZNPT9K5DHVkBiP

## For the security of the website we are using "Arcjet"

Link: https://arcjet.com/?ref=roadsidecoder-2025-03
1.Login with google
2.create a new site
3.Copy the API key and past in the env file

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
