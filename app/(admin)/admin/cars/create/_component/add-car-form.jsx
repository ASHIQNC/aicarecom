'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useFetch from '@/hooks/use-fetch';
import { addCar } from '@/actions/cars';
import { useRouter } from 'next/navigation';
import AiCarFor from './ai-car-form';
//for the api of addcar we have added in the action file
//first of all we can predefine the option for the dropdown icon in the form

// Predefined options
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const transmissions = ['Automatic', 'Manual', 'Semi-Automatic'];
const bodyTypes = [
  'SUV',
  'Sedan',
  'Hatchback',
  'Convertible',
  'Coupe',
  'Wagon',
  'Pickup',
];
const carStatuses = ['AVAILABLE', 'UNAVAILABLE', 'SOLD'];

// Zod is a TypeScript-first schema declaration and validation library.
// It allows you to define the shape of your data (like form inputs or API payloads) and validate that data easily and safely
// Define form schema with Zod
const carFormSchema = z.object({
  // min value or error message(if we not add any value)
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  //year should be a number and it should be more that 1900 and should be less than currect year

  year: z.string().refine((val) => {
    const year = parseInt(val);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
  }, 'Valid year required'),
  price: z.string().min(1, 'Price is required'),
  mileage: z.string().min(1, 'Mileage is required'),
  color: z.string().min(1, 'Color is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  bodyType: z.string().min(1, 'Body type is required'),
  //optional value
  seats: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'SOLD']),
  featured: z.boolean().default(false),
  // Images are handled separately
});
const AddCarForm = () => {
  //state whichtab is active or not
  const [activeTab, setActiveTab] = useState('ai');
  const [uploadedImages, setUploadedImages] = useState([]);

  const [imageError, setImageError] = useState('');
  const router = useRouter();

  //first we need define the schema
  // zodResolver is a helper that connects Zod with React Hook Form.

  // It takes your carFormSchema and tells React Hook Form to validate form data using that schema.
  const {
    // register will connect our form with react hook form
    register,
    //manually setting the value in form
    setValue,
    //manually getting the value
    getValues,
    //formstate will get the error if there is any error,for form validation

    formState: { errors },
    //for submitting the form
    handleSubmit,
    //will help us to monitor the field
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    //we can also add default value to the form
    defaultValues: {
      make: '',
      model: '',
      year: '',
      price: '',
      mileage: '',
      color: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      seats: '',
      description: '',
      status: 'AVAILABLE',
      featured: false,
    },
  });

  // dropZone
  // when we drag and drop the image or upload the image items comes here
  const onMultiImagesDrop = useCallback((acceptedFiles) => {
    //here we are taking multiple images so wee need to check each and everyfile regarding the MB
    const validFile = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit and will be skipped`);

        return false;
      }
      return true;
    });

    if (validFile.length === 0) return;

    // process the images here
    const newImages = [];
    validFile.forEach((file) => {
      // this reader will help us to know if the image is loaded or not
      // its inbuild function

      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);

        // When all images are processed
        if (newImages.length === validFile.length) {
          // previous uploaded image as well as the newImage
          setUploadedImages((prev) => [...prev, ...newImages]);
          setUploadProgress(0);
          setImageError('');
          toast.success(`Successfully uploaded ${validFile.length} images`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  //for getting multiple images
  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },

    //for adding multiple image
    multiple: true,
  });

  //we are fetching the api call from action file
  //here we are getting the "data" and we are renaming data as addCarResult "data:addCarResult"
  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFn,
  } = useFetch(addCar);

  //here we showing some indicator for that we are using useEffect

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success('Car added successfully');
      router.push('/admin/cars');
    }
  }, [addCarResult, addCarLoading]);
  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError('Please upload at least one image');
      return;
    }
    //this is the form data and this we will send to the api
    console.log(data, uploadedImages);
    const carData = {
      //provide the data we are getting from the form
      ...data,
      //year shoould be in number
      year: parseInt(data?.year),
      price: parseFloat(data?.price),
      mileage: parseInt(data?.mileage),
      seats: data?.seats ? parseInt(data.seats) : null,
    };
    console.log('data', carData);
    //this funtion the api call
    //we extracted this from the custome hook
    // we need to pass the car data as well as the images

    await addCarFn({
      carData,
      images: uploadedImages,
    });
  };

  // remove image
  const removeImage = (index) => {
    // take eachand every image index
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue='ai'
        className='mt-6'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='manual'>Manual Entry</TabsTrigger>
          <TabsTrigger value='ai'>AI Upload</TabsTrigger>
          {/* manual */}
        </TabsList>
        <TabsContent value='manual' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Enter the details of the car you want to add.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* form */}

              <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='make'>Make</Label>
                    {/* register is used to connect with reactHookForm */}
                    <Input
                      id='make'
                      {...register('make')}
                      placeholder='e.g. Toyota'
                      className={errors.make ? 'border-red-500' : ''}
                    />
                    {errors.make && (
                      <p className='text-xs text-red-500'>
                        {errors.make.message}
                      </p>
                    )}
                  </div>

                  {/* model */}

                  <div className='space-y-2'>
                    <Label htmlFor='model'>Model</Label>
                    {/* register is used to connect with reactHookForm */}
                    <Input
                      id='model'
                      {...register('model')}
                      placeholder='e.g. Camry'
                      className={errors.model ? 'border-red-500' : ''}
                    />
                    {errors.model && (
                      <p className='text-xs text-red-500'>
                        {errors.model?.message}
                      </p>
                    )}
                  </div>

                  {/* year */}

                  <div className='space-y-2'>
                    <Label htmlFor='year'>Year</Label>
                    {/* register is used to connect with reactHookForm */}
                    <Input
                      id='year'
                      {...register('year')}
                      placeholder='e.g. 2022'
                      className={errors.year ? 'border-red-500' : ''}
                    />
                    {errors.year && (
                      <p className='text-xs text-red-500'>
                        {errors.year?.message}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className='space-y-2'>
                    <Label htmlFor='price'>Price ($)</Label>
                    <Input
                      id='price'
                      {...register('price')}
                      placeholder='e.g. 25000'
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className='text-xs text-red-500'>
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Mileage */}
                  <div className='space-y-2'>
                    <Label htmlFor='mileage'>Mileage</Label>
                    <Input
                      id='mileage'
                      {...register('mileage')}
                      placeholder='e.g. 15000'
                      className={errors.mileage ? 'border-red-500' : ''}
                    />
                    {errors.mileage && (
                      <p className='text-xs text-red-500'>
                        {errors.mileage.message}
                      </p>
                    )}
                  </div>

                  {/* Color */}
                  <div className='space-y-2'>
                    <Label htmlFor='color'>Color</Label>
                    <Input
                      id='color'
                      {...register('color')}
                      placeholder='e.g. Blue'
                      className={errors.color ? 'border-red-500' : ''}
                    />
                    {errors.color && (
                      <p className='text-xs text-red-500'>
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  {/* FuelType */}

                  <div className='space-y-2'>
                    <Label htmlFor='fueltype'>Fuel Type</Label>
                    {/* here we are not using register.but here we are using setValue for dynamically setting the value */}
                    <Select
                      onValueChange={(value) => setValue('fuelType', value)}
                      defaultValue={getValues('fuelType')}
                    >
                      <SelectTrigger
                        className={errors.fuelType ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select fuel type' />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => {
                          return (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className='text-xs text-red-500'>
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>

                  {/* Transmition */}

                  <div className='space-y-2'>
                    <Label htmlFor='fueltype'>Transmission</Label>
                    {/* here we are not using register.but here we are using setValue for dynamically setting the value */}
                    <Select
                      onValueChange={(value) => setValue('transmission', value)}
                      defaultValue={getValues('transmission')}
                    >
                      <SelectTrigger
                        className={errors.transmission ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select Transmission' />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => {
                          return (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className='text-xs text-red-500'>
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>

                  {/* Body Type */}
                  <div className='space-y-2'>
                    <Label htmlFor='bodyType'>Body Type</Label>
                    <Select
                      onValueChange={(value) => setValue('bodyType', value)}
                      defaultValue={getValues('bodyType')}
                    >
                      <SelectTrigger
                        className={errors.bodyType ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select body type' />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className='text-xs text-red-500'>
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>

                  {/* Seats */}
                  <div className='space-y-2'>
                    <Label htmlFor='seats'>
                      Number of Seats{' '}
                      <span className='text-sm text-gray-500'>(Optional)</span>
                    </Label>
                    <Input
                      id='seats'
                      {...register('seats')}
                      placeholder='e.g. 5'
                    />
                  </div>

                  {/* Status */}
                  <div className='space-y-2'>
                    <Label htmlFor='status'>Status</Label>
                    <Select
                      onValueChange={(value) => setValue('status', value)}
                      defaultValue={getValues('status')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Description */}
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    {...register('description')}
                    placeholder='Enter detailed description of the car...'
                    className={`min-h-32 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className='text-xs text-red-500'>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* checkbox */}

                <div className='flex items-start  space-x-3 space-y-0 rounded-md p-4 border'>
                  <Checkbox
                    id='featured'
                    // check whether the featured has been changed or not
                    checked={watch('featured')}
                    // here we will be updating the value
                    onCheckedChange={(checked) => {
                      setValue('featured', checked);
                    }}
                  ></Checkbox>
                  {/* to make in a single. line the class style */}
                  <div className='space-y-1 leading-none'>
                    <Label htmlFor='featured'>Feature this Car</Label>
                    <p className='text-sm text-gray-500'>
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>

                {/* image dropzone */}
                <div>
                  <div>
                    <Label
                      htmlFor='images'
                      className={imageError ? 'text-red-500' : ''}
                    >
                      {' '}
                      Images
                      {imageError && <span className='text-red-500'>*</span>}
                    </Label>
                    <div
                      {...getMultiImageRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 mt-2 text-center cursor-pointer hover:bg-gray-50 transition ${
                        imageError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <input {...getMultiImageInputProps()} />
                      <div className='flex flex-col items-center justify-center'>
                        <Upload className='h-12 w-12 text-gray-400 mb-3' />
                        <span className='text-sm text-gray-600'>
                          Click to upload multiple images
                        </span>
                        <span className='text-xs text-gray-500 mt-1'>
                          (JPG, PNG, WebP, max 5MB each)
                        </span>
                      </div>
                    </div>
                  </div>
                  {imageError && (
                    <p className='text-xs text-red-500 mt-1'>{imageError}</p>
                  )}

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <div className='mt-4'>
                      <h3 className='text-sm font-medium mb-2'>
                        Uploaded Images ({uploadedImages.length})
                      </h3>
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                        {uploadedImages.map((image, index) => (
                          <div key={index} className='relative group'>
                            <Image
                              src={image}
                              alt={`Car image ${index + 1}`}
                              height={50}
                              width={50}
                              className='h-28 w-full object-cover rounded-md'
                              priority
                            />
                            {/* button for removing the image that is "x icon" situated top right side of the image */}
                            <Button
                              type='button'
                              size='icon'
                              variant='destructive'
                              className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                              onClick={() => removeImage(index)}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* button for uploading the data */}

                <Button
                  type='submit'
                  className='w-full md:w-auto'
                  disabled={addCarLoading}
                >
                  {addCarLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Adding Car...
                    </>
                  ) : (
                    'Add Car'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ai */}
        <TabsContent value='ai' className='mt-6'>
          {/* ee rand valuevum nammal ai image upload cheyumpo formil data veran vendi prop aayit ai componentile ayakknnu
           */}
          {/* avdnn data ennit ee valuevil setcheyuunnu */}
          <AiCarFor
            setValue={setValue}
            setUploadedImages={setUploadedImages}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCarForm;
