## GEMINI

first we need the logic for scaning the image with ai for that we need geminie api

## Link :https://aistudio.google.com

1. create a account in gemini
2. login to the account
3. click on the getapikey section
4. create api key and copy that api key, and paste in the env file
5. installl this package in your project
   npm i @google/generative-ai --legacy-peer-deps
6. go to the action file and create cars.js,inside the write the api for gemini and also write the api for addcars

   Note:
   we need to add the below code in the next.config file since there is an issue while taking the image from supabase
   by default this will be true we need to make the false.

   // experimental: {
   // serverComponentsHmrCache: false, // defaults to true
   // },

   //also we need to tell the next js that we are using supase image url
   //for that we need to add the following code in the config fiel

   // images: {
   // remotePatterns: [
   // {
   // protocol: "https",
   // hostname: "ymqpkygmownybanldbpq.supabase.co",
   // },
   // ],
   // },

//note:

### RevalidatePath

Why revalidatePath("/admin/cars") is used:
Next.js can cache pages to make them load faster.

The page at /admin/cars might be showing old (cached) data.

When you update a car (like its status or featured tag), the backend changes, but the UI doesn't update automatically.

revalidatePath("/admin/cars") tells Next.js:
👉 "Hey, this page's data has changed. Please refresh it."
