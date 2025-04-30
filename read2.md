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

2. after initialising you will get a prisma folder inside that add the model /schema that need to be
   added in the data base .also the add the database url and for supabase we have directurl as well

3. after creating the schema we needd to add this in the supabase database .
   "npx prisma migrate dev --name create-models"
4. if you get any error install the dependecies as well
5. to check whether the table has been created or not go to the supabase ->select the project
   ->table editor ->You can see the table that we have created

6. After that go to lib folder and create prisma instance
   ->if we want communicate with the data base we need to create a prisma instance.tthat is call to the database
