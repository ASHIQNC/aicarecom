'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Camera, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/use-fetch';
import { processImageSearch } from '@/actions/home';
const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImageStateActive, setIsImageStateActive] = useState(false);
  const [imagePreview, setimagePreview] = useState('');
  const [searchImage, setsearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const {
    loading: isProcessing,
    fn: processImageFn,
    data: processResult,
    error: processError,
  } = useFetch(processImageSearch);

  // when we drag and drop the image or upload the image items comes here
  const onDrop = useCallback((acceptedFiles) => {
    // we will get the file
    const file = acceptedFiles[0];
    if (file) {
      // check file size is more than 5mb
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size is more than 5 mb');
        return;
      }

      setIsUploading(true);
      setsearchImage(file);
      // this reader will help us to know if the image is loaded or not
      // its inbuild function

      const reader = new FileReader();
      reader.onloadend = () => {
        setimagePreview(reader.result);
        setIsUploading(false);
        toast.success('Image Uploaded Successfully');
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error('Failed to read the image');
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png'],
      },
      maxFiles: 1,
    });

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Please enter search term');
      return;
    }
    // encodeURIComponent : if we give this, if there is a space or any other thing this will manage the url
    router.push(`/car?search=${encodeURIComponent(searchTerm)}`);
  };
  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error('Please upload an image first');
      return;
    }

    //add logic
    //call the function for ai image that we created
    await processImageFn(searchImage);
  };

  //lets handle the success and error condition
  useEffect(() => {
    if (processError) {
      toast.error(
        'Failed to analyze image:' + (processError.message || 'Unknown error')
      );
    }
  }, [processError]);

  // it it is success we need to send this to car listing page
  // Handle process result and errors with useEffect
  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams();

      // Add extracted params to the search
      //we are adding the name ,bodytypeandcolor exist its added in the url
      if (processResult.data.make) params.set('make', processResult.data.make);
      if (processResult.data.bodyType)
        params.set('bodyType', processResult.data.bodyType);
      if (processResult.data.color)
        params.set('color', processResult.data.color);

      // Redirect to search results
      router.push(`/car?${params.toString()}`);
    }
  }, [processResult, router]);
  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className='relative flex items-center'>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type='text'
            placeholder='Enter make,model, or use our AI Image Search...'
            className='pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm'
          />
          <div className='absolute right-[100px]'>
            <Camera
              size={35}
              style={{
                background: isImageStateActive ? 'black' : '',
                color: isImageStateActive ? 'white' : '',
              }}
              className='cursor-pointer rounded-xl p-1.5'
              onClick={() => setIsImageStateActive(!isImageStateActive)}
            />
          </div>
          <Button type='submit' className='absolute right-2 rounded-full '>
            Search
          </Button>
        </div>
      </form>
      {/* a section to drop image will apear here if we click on the camera icon */}
      {isImageStateActive && (
        <div className='mt-4'>
          <form onSubmit={handleImageSearch}>
            <div className='border-2 border-dashed text-center border-gray-300 rounded-3xl p-6'>
              {imagePreview ? (
                <div className='flex justify-center items-center flex-col'>
                  <img
                    src={imagePreview}
                    alt='car preview '
                    className='h-40 object-contain mb-4'
                  ></img>

                  {/* button for removing the image */}
                  <Button
                    className='cursor-pointer mt-2'
                    variant='outline'
                    onClick={() => {
                      setsearchImage(null);
                      setimagePreview('');
                      toast.info('Image removed');
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                // cheack the documentation of react dragdrop
                <div {...getRootProps()} className='cursor-pointer'>
                  <input {...getInputProps()} />
                  <div className='flex items-center flex-col'>
                    <Upload className='h-12 w-12 text-gray-400 mb-2' />
                    <p className='mb-2 text-gray-500'>
                      {isDragActive && !isDragReject
                        ? 'Leave the file here to upload'
                        : 'Drag &drop a car image or click to select'}
                    </p>
                    {isDragReject && (
                      <p className='text-red-500 mb-2'>Invalid image type</p>
                    )}
                    <p className='text-gray-400 text-sm'>
                      Supports: JPG PNG (max 5Mb)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* image search aanel oru button koode venm for that  */}
            {/* image preview aanel show the button */}
            {imagePreview && (
              <Button
                className='w-full mt-2'
                type='submit'
                disabled={isUploading || isProcessing}
              >
                {isUploading
                  ? 'Uploading...'
                  : isProcessing
                  ? 'Analyzing Image...'
                  : 'search with this image'}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
