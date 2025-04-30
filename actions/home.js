//server action for getting the featured cars
'use server';
import aj from '@/lib/arcjet';
import { serializeCarData } from '@/lib/helper';
import { db } from '@/lib/prisma';
import { request } from '@arcjet/next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await db.car.findMany({
      where: {
        featured: true,
        status: 'AVAILABLE',
      },
      //we only want 3 cars
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('cars', cars);

    // we will be getting the price as well we need to serialise the price
    //we have already created serialiseCarData function use that

    return cars.map(serializeCarData);
  } catch (error) {
    return new Error('Error fetching featured cars:' + error.message);
  }
}

//base64
//fucntion to convert the image to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

//image search using ai . this is quaite similar the function that we created

export async function processImageSearch(file) {
  try {
    //add rate limiting using arcjet
    //take the request from arcjet
    const req = await request();

    //then we want to check the rate limiting
    const decision = await aj.protect(req, {
      // mention how many token it consume per search
      requested: 1,
    });

    // if the decition is denied we need to check what is caurse
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        console.error({
          code: 'RATE_LIMIT_EXCEEDED',
          detail: {
            remaining,
            reset,
          },
        });

        throw new Error('Too many request. Please try again later');
      }

      // if it is not about rate limiting we can throw error like

      throw new Error('Request blocked');
    }

    //image processing
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
      Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer)
      2. Body type (SUV, Sedan, Hatchback, etc.)
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
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

    try {
      const carDetails = JSON.parse(cleanedText);

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
    throw new Error('AI Search error:' + error.message);
  }
}
