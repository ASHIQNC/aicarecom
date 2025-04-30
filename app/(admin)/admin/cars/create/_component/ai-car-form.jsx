'use client';
import { processCarImageWithAI } from '@/actions/cars';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import useFetch from '@/hooks/use-fetch';
import { Camera, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const AiCarFor = ({ setValue, setUploadedImages, setActiveTab }) => {
  const [uploadedAiImage, setUploadedAiImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle AI image upload with Dropzone
  const onAiDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadedAiImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      toast.success('Image upload successfully');
    };
    reader.readAsDataURL(file);
  }, []);

  //this is for ai dropzone
  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      },
      maxFiles: 1,
      multiple: false,
    });

  //here we are calling the server action for upload  ai image and get the details
  const {
    loading: processImageLoading,
    fn: processImagefn,
    data: processImageResult,
    error: pocessImageError,
  } = useFetch(processCarImageWithAI);

  //   when we click extract detail button it will call this function
  const processWithAI = async () => {
    //error handling
    if (!uploadedAiImage) {
      toast.error('Please upload the image');
      return;
    }
    await processImagefn(uploadedAiImage);
  };

  useEffect(() => {
    if (pocessImageError) {
      toast.error(pocessImageError.message || 'Failed to upload car');
    }
  }, [pocessImageError]);

  //if its is succesfull.we need to add the details in form automatically
  //setValue is coming as a prop from the form
  console.log('processed', processImageResult);
  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult.data;
      console.log('cardetailsssss', carDetails);

      // Update form with AI results
      setValue('make', carDetails.make);
      setValue('model', carDetails.model);
      setValue('year', carDetails.year.toString());
      setValue('color', carDetails.color);
      setValue('bodyType', carDetails.bodyType);
      setValue('fuelType', carDetails.fuelType);
      setValue('price', carDetails.price);
      setValue('mileage', carDetails.mileage);
      setValue('transmission', carDetails.transmission);
      setValue('description', carDetails.description);

      //also we need to add the selected image as well
      const reader = new FileReader();

      reader.onload = (e) => {
        //previouse value plus currect value(ie image)
        setUploadedImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(uploadedAiImage);

      toast.success('Successfully extracted car details', {
        description: `Detected ${carDetails.year} ${carDetails.make} ${
          carDetails.model
        } with ${Math.round(carDetails.confidence * 100)}% confidence`,
      });
      setActiveTab('manual');
    }
  }, [processImageResult, uploadedAiImage]);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Car Details Extraction</CardTitle>
          <CardDescription>
            Upload an image of a car and let Gemini AI extract its details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='space-y-6'>
            <div className='border-2 border-dashed rounded-lg p-6 text-center'>
              {/* if the image preview is selcted show the div or show other div */}
              {imagePreview ? (
                //when we select the image we need to display the image
                <div className='flex flex-col items-center'>
                  <img
                    src={imagePreview}
                    alt='car Preview'
                    className='max-h-56 max-w-full object-contain mb-4'
                  />

                  {/* removing the image */}
                  <div className='gap-2 flex'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setImagePreview(null);
                        setUploadedAiImage(null);
                      }}
                    >
                      Remove
                    </Button>

                    <Button
                      size='sm'
                      onClick={processWithAI}
                      disabled={processImageLoading}
                    >
                      {processImageLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 animate-spin' />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Camera className='mr-2 h-4 w-4' />
                          Extract Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // this is for drag and drop
                <div
                  {...getAiRootProps()}
                  className='cursor-pointer hover:bg-gray-50 transition'
                >
                  <input {...getAiInputProps()} />
                  <div className='flex flex-col items-center justify-center'>
                    <Camera className='h-12 w-12 text-gray-400 mb-3' />
                    <span className='text-sm text-gray-600'>
                      Click to upload a car image
                    </span>
                    <span className='text-xs text-gray-500 mt-1'>
                      (JPG, PNG, WebP, max 5MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* guideline */}

            <div className='bg-gray-50 p-4 rounded-md'>
              <h3 className='font-medium mb-2'>How it works</h3>
              <ol className='space-y-2 text-sm text-gray-600 list-decimal pl-4'>
                <li>Upload a clear image of the car</li>
                <li>Click "Extract Details" to analyze with Gemini AI</li>
                <li>Review the extracted information</li>
                <li>Fill in any missing details manually</li>
                <li>Add the car to your inventory</li>
              </ol>
            </div>
            <div className='bg-amber-50 p-4 rounded-md'>
              <h3 className='font-medium text-amber-800 mb-1'>
                Tips for best results
              </h3>
              <ul className='space-y-1 text-sm text-amber-700'>
                <li>• Use clear, well-lit images</li>
                <li>• Try to capture the entire vehicle</li>
                <li>• For difficult models, use multiple views</li>
                <li>• Always verify AI-extracted information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCarFor;
