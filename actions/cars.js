//this is the place we write for the admin related car page
'use server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { serializeCarData } from '@/lib/helper';

//fucntion to convert the image to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}
//first we need the logic for scaning the image with ai for that we need geminie api

export async function processCarImageWithAI(file) {
  // inside this we will write the logic for processing our image

  try {
    // check the gemini api are avaialable or not
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    //this package will be taking api key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // we will need the model for processing our image
    //we will be using gemini 1.5 flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // we have the image file we need to convert this to base64 image
    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        // mention the image tyoe
        mimeType: file.type,
      },
    };

    // after taking the image qw need to write "PROMPT" and tell what the api need to do
    //expectialy we training the ai and tell to analyse the image and extract the following information
    // after analysing the image format all the information and form an object
    const prompt = `
   Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      10. Short Description as to be added to a car listing
   Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    //in the result use the model to generate the content and provide the image part and the prompt to generate the content
    const result = await model.generateContent([imagePart, prompt]);

    // this response need to be convert to text format
    const response = await result.response;
    const text = response.text();

    //this text contain backticks ,dots etc
    //we need to clean the text
    const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

    //what ever object that we are getting we will parse it and convert the string to an object
    try {
      const carDetails = JSON.parse(cleanedText);
      console.log('cardetails', carDetails);

      //we need  to validate the response

      const requiredFields = [
        'make',
        'model',
        'year',
        'color',
        'bodyType',
        'price',
        'mileage',
        'fuelType',
        'transmission',
        'description',
        'confidence',
      ];
      // here we are checking whether there is any missing field
      //here we are checking each and every field exist in the carDetail or not
      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      //if missing field is more than zero throw error
      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields:${missingFields.join(', ')}`
        );
      }

      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', text);
      return {
        success: false,
        error: 'Failed to parse AI response',
      };
    }
  } catch (error) {
    console.log('error gemini', error.message);
    console.error();
    throw new Error('Gemini API error:' + error.message);
  }
}

//server action for adding the data to the databse

export async function addCar({ carData, images }) {
  //this is a protexted route only the authorised user can add the data
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

    if (!user) throw new Error('User not found');

    //here we are using uuid package for creating unique id
    //here we are storing the imag ein the supabase bucket we need uique id to the data
    // npm i uuid --legacy-peer-deps

    // Create a unique folder name for this car's images
    const carId = uuidv4();
    //isnide the bucket we need folder path
    const folderPath = `cars/${carId}`;

    //we need to initailise the supabase (bucket)client for generating the image
    // go to supabase store ->connect->appframework-> pafe.tsx->copy the things that we needed
    const cookieStore = await cookies();
    //we ahave writted the createClient in the lib folder

    const supabase = createClient(cookieStore);

    //store the image url inside an array
    const imageUrls = [];

    //looping the images and store in the above array
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith('data:image/')) {
        console.warn('Skipping invalid image data');
        continue;
      }

      // Extract the base64 part (remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(',')[1];
      const imageBuffer = Buffer.from(base64, 'base64');

      //we need to know the file extention of this

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      //   if the mimetype matches take the first value or make this as jpeg
      const fileExtension = mimeMatch ? mimeMatch[1] : 'jpeg';

      //we need to add the file name for this image
      // Create filename
      //${i} comes from the forloop
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;

      //in the path we add file name as well
      const filePath = `${folderPath}/${fileName}`;

      //finally we need to generate the image
      //car-images-bucket name
      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(filePath, imageBuffer, {
          //content type
          contentType: `image/${fileExtension}`,
        });

      //if there is any error throw the error
      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      //this will be the publick url for the image
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`; // disable cache in config
      imageUrls.push(publicUrl);

      if (imageUrls.length === 0) {
        throw new Error('No valid images were uploaded');
      }
      //Note:
      //we need to add the below code in the next.config file since there is an issue while taking the image from supabase
      //by default this will be true  we need to make the false.

      //   experimental: {
      //     serverComponentsHmrCache: false, // defaults to true
      //   },

      //also we need to tell the next js that we are using supase image url
      //for that we need to add the following code in the config fiel

      //  images: {
      //     remotePatterns: [
      //       {
      //         protocol: "https",
      //         hostname: "ymqpkygmownybanldbpq.supabase.co",
      //       },
      //     ],
      //   },

      // Add the car to the database
      const car = await db.car.create({
        data: {
          id: carId, // Use the same ID we used for the folder
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          mileage: carData.mileage,
          color: carData.color,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          bodyType: carData.bodyType,
          seats: carData.seats,
          description: carData.description,
          status: carData.status,
          featured: carData.featured,
          images: imageUrls, // Store the array of image URLs
        },
      });

      revalidatePath('/admin/cars');

      return {
        success: true,
      };
    }
  } catch (error) {
    throw new Error(`Error adding car: ${error.message}`);
  }
}

//get the car details
//this also take the search paraams if we want to search the cars
export async function getCars(search = '') {
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

    //we can build the condition for what we have need to find
    let where = {};

    //we are searching using make,color and model
    //search should match either make,model or color of the car
    if (search) {
      where.OR = [
        { make: { contain: search, mode: 'insensitive' } },
        { model: { contain: search, mode: 'insensitive' } },
        { color: { contain: search, mode: 'insensitive' } },
      ];
    }

    //now we can exicute the query in the data base
    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    console.log('cars', cars);

    //here when we are getting the data th price is in string
    //so we need to convert the data and serialise the data
    //we need tp create this function "serializedCarData" in the helper file
    const serializedCars = cars?.map(serializeCarData);
    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error('error in fecthing the cars:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

//deleting the car
export async function deleteCars(id) {
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

    // we need to delete the image as well.fetch th car details
    const car = await db.car.findUnique({
      where: {
        id,
      },
      // we need to fetch the image as well
      select: { images: true },
    });

    // if the car doesnot exist we need to return false
    if (!car) {
      return {
        success: false,
        error: 'Car not Found ',
      };
    }

    //if there is car we need to delete it from the database
    await db.car.delete({
      where: { id },
    });

    //we need to delete the image as well
    // Delete the images from Supabase storage
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      //get the car imagess
      const filePaths = car.images
        .map((imageUrl) => {
          //we will create a new url
          const url = new URL(imageUrl);
          //check te url present inside this folder inside the bucket  "car-images" (same as the name inside the supabase bucket)
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);

          //if the path matches return it or return null
          return pathMatch ? pathMatch[1] : null;
          //if there is path we will filter out those are true
        })
        .filter(Boolean);

      // Delete files from storage if paths were extracted
      if (filePaths.length > 0) {
        //if the filePath lengthis more than zero remove the file
        //also we are extracting the error as well
        //if there is eerror show the error
        const { error } = await supabase.storage
          .from('car-images')
          .remove(filePaths);

        if (error) {
          console.error('Error deleting images:', error);
          // We continue even if image deletion fails
        }
      }
    } catch (storageError) {
      console.error('Error with storage operations:', storageError);
      // Continue with the function even if storage operations fail
    }

    //after the image thing is done we are revalidating the page
    revalidatePath('/admin/cars');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting car:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// updating the status of the car whether car is available or not available ,whether the user buy the car or not
//we will take carid,currentStatus and if it is featured or not
export async function updateCarsStatus(id, { status, featured }) {
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

    //this is the place where we define what are the data wwe want to update

    const updateData = {};

    //if the status is not undefined we need to add status inside the updateData
    if (status !== undefined) {
      updateData.status = status;
    }

    //if the featured is not undefined we need to add featured inside the updateData
    if (featured !== undefined) {
      updateData.featured = featured;
    }

    //now we are updating the data
    await db.car.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the cars list page
    //to  get the fresh updated data we are revalidating the page
    // We use revalidatePath("/admin/cars") to make sure the admin cars page shows the latest data after updating a car.
    // In frameworks like Next.js, pages can be cached for better performance,
    // so when we change something in the backend (like the car's status or featured flag), the page might still show old data.
    //  Revalidating the path clears that cache and forces the page to refresh, ensuring the updated info is visible right away.
    revalidatePath('/admin/cars');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating car status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
