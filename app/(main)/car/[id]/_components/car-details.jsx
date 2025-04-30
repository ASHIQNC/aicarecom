'use client';

import { toggleSavedCars } from '@/actions/car-listing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useFetch from '@/hooks/use-fetch';
import { formatCurrency } from '@/lib/helper';
import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  CalendarRange,
  Car,
  Currency,
  Fuel,
  Gauge,
  Heart,
  LocateFixed,
  MessageSquare,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import EmiCalculator from './emi-calculator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CarDetailsPage = ({ car, testDriveInfo }) => {
  const router = useRouter();
  //check whther signedin or not
  const { isSignedIn } = useAuth();

  //state for maintaining wishlisted or not
  const [isWishListed, setIsWishListed] = useState(car.wishlisted);

  //carousel for images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  //for toggling the saved and unsaved of car
  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCars);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isWishListed) {
      setIsWishListed(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isWishListed]);
  console.log('saved', isWishListed);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error('Failed to update favorites');
    }
  }, [toggleError]);

  //toggling in save or not save
  const handleSaveCar = async (e) => {
    // check whhether the user is signedIn or not
    if (!isSignedIn) {
      toast.error('Please sign in to save cars');
      router.push('/sign-in');
      return;
    }

    //check whether already save or not if yes return nothing
    if (savingCar) return;

    //if not call the togglesaved cars
    try {
      await toggleSavedCarFn(car?.id);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car?.year} ${car?.make} ${car?.model}`,
          text: `Check out this${car?.year} ${car?.make} ${car?.model} on Vehiql`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log('Error sharing', error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleBookTestDrive = () => {
    //check whether the user is logged in or not
    if (!isSignedIn) {
      toast.error('Please sign in to book a test drive');
      router.push('/sign-in');
      return;
    }

    router.push(`/test-drive/${car.id}`);
  };
  return (
    <div>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* we will be rendering all the images here */}
        {/* image gallery */}
        {/* for larger screen width will take 7 blocks over 12 blocks */}
        <div className='w-full lg:w-7/12'>
          <div className='aspect-video rounded-lg overflow-hidden relative mb-4'>
            {car?.images && car.images?.length > 0 ? (
              <Image
                src={car?.images[currentImageIndex]}
                alt={`${car?.year} ${car?.make} ${car?.model}`}
                fill
                className='object-cover'
                priority
              />
            ) : (
              <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                <Car className='h-24 w-24 text-gray-400' />
              </div>
            )}
          </div>

          {/* thumpnile for image gallery */}
          {car?.images && car?.images?.length > 1 && (
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {car?.images?.map((image, index) => {
                return (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                      //if the index is same as the current index give border arround it
                      index === currentImageIndex
                        ? 'border-2 border-blue-600'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${car?.year} ${car?.make} ${car?.model} - view ${
                        index + 1
                      } `}
                      fill
                      className='object-cover'
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Secondary Actions */}
          {/* wishlisted icon and ability to share the car */}

          <div className='flex gap-4 mt-2'>
            <Button
              variant='outline'
              className={`flex items-center gap-2 flex-1 ${
                isWishListed ? 'text-red-500' : ''
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishListed ? 'fill-red-500' : ''}`}
              />
              {isWishListed ? 'Saved' : 'Save'}
            </Button>

            {/* share car */}
            {/* this one will allow us to copy the link for this car*/}
            <Button
              className='flex items-center flex-1'
              variant='outline'
              onClick={handleShare}
            >
              <Share2 className='h-5 w-5' />
              Share
            </Button>
          </div>
        </div>

        {/* car details */}

        <div>
          <div className='flex items-center justify-between'>
            <Badge className='mb-2'>{car?.bodyType}</Badge>
          </div>
          <h1 className='text-4xl font-bold mb-1'>
            {car.year} {car.make} {car.model}
          </h1>

          <div className='text-2xl font-bold text-blue-600'>
            {formatCurrency(car.price)}
          </div>
          {/* Quick Stats */}
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 my-6'>
            <div className='flex items-center gap-2'>
              <Gauge className='text-gray-500 h-5 w-5' />
              <span>{car?.mileage.toLocaleString()} miles</span>
            </div>
            <div className='flex items-center gap-2'>
              <Fuel className='text-gray-500 h-5 w-5' />
              <span>{car?.fuelType}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Car className='text-gray-500 h-5 w-5' />
              <span>{car?.transmission}</span>
            </div>
          </div>
          {/* here there will be a button will show some estimated emi
        when we click on that a popup will come where we can calculte the emi for this car*/}

          <Dialog>
            {/* button to open the dialogue box */}
            <DialogTrigger className='w-full text-start'>
              <Card>
                <CardContent>
                  <div className='flex items-center gap-2 text-lg font-medium mb-2'>
                    <Currency className='h-5 w-5 text-blue-600' />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className='text-sm text-gray-600'>
                    Estimated Monthly Payment:{' '}
                    <span className='font-bold text-gray-900'>
                      {formatCurrency(car.price / 60)}
                    </span>{' '}
                    for 60 months
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    *Based on $0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Emi Calculator</DialogTitle>
                <EmiCalculator price={car?.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Request More Info */}
          <Card className='my-6'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2 text-lg font-medium mb-2'>
                <MessageSquare className='h-5 w-5 text-blue-600' />
                <h3>Have Questions?</h3>
              </div>
              <p className='text-sm text-gray-600 mb-3'>
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href='mailto:ash5@gmail.com'>
                <Button variant='outline' className='w-full'>
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* status of the car whether it is sold or not */}

          {(car.status === 'SOLD' || car.status === 'UNAVAILABLE') && (
            <Alert variant='destructive'>
              <AlertTitle className='capitalize'>
                This car is {car?.status?.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/*  if the car is not sold or unawailable there should show a button
          so that user can book a test drive*/}

          {car.status !== 'SOLD' && car?.status !== 'UNAVAILABLE' && (
            <Button
              className='w-full py-6 text-lg'
              disabled={testDriveInfo.userTestDrive}
              onClick={handleBookTestDrive}
            >
              <Calendar className='mr-2 h-5 w-5' />
              {testDriveInfo.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    'EEEE, MMMM d, yyyy'
                  )}`
                : 'Book Test Drive'}
            </Button>
          )}
        </div>
      </div>

      {/* description */}

      {/* Details & Features Section */}
      <div>
        <div className='mt-12 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm w-full lg:w-1/2'>
          <Accordion className='w-full space-y-4' collapsible>
            <AccordionItem value='description'>
              <AccordionTrigger className='text-left '>
                <h3 className='font-bold'>Description</h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className='whitespace-pre-line text-gray-700 dark:text-gray-300'>
                  {car.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Features Section */}
        <div className='mt-12 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm w-full lg:w-1/2'>
          <Accordion className='w-full space-y-4' collapsible>
            <AccordionItem value='specs'>
              <AccordionTrigger className='text-left '>
                <h3 className='font-bold'> Features</h3>
              </AccordionTrigger>
              <AccordionContent>
                <ul className='grid grid-cols-1 gap-3 text-gray-700 dark:text-gray-300'>
                  <li className='flex items-center gap-2'>
                    <span className='h-2 w-2 bg-blue-600 rounded-full'></span>
                    {car.transmission} Transmission
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='h-2 w-2 bg-blue-600 rounded-full'></span>
                    {car.fuelType} Engine
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='h-2 w-2 bg-blue-600 rounded-full'></span>
                    {car.bodyType} Body Style
                  </li>
                  {car.seats && (
                    <li className='flex items-center gap-2'>
                      <span className='h-2 w-2 bg-blue-600 rounded-full'></span>
                      {car.seats} Seats
                    </li>
                  )}
                  <li className='flex items-center gap-2'>
                    <span className='h-2 w-2 bg-blue-600 rounded-full'></span>
                    {car.color} Exterior
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Specifications */}
      <div className='mt-8  w-full lg:w-1/2'>
        <div className='p-6 bg-white rounded-xl shadow-md'>
          <h2 className='text-2xl font-bold mb-4'>Specifications</h2>

          <div className='bg-white rounded-lg p-4'>
            <div
              className='grid grid-cols-1 gap-y-4 overflow-hidden transition-all duration-300 ease-in-out'
              style={{ maxHeight: showMore ? '1000px' : '280px' }}
            >
              <div className='flex justify-between py-2 '>
                <span className='text-gray-600'>Make</span>
                <span className='font-medium'>{car.make}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600'>Model</span>
                <span className='font-medium'>{car.model}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600'>Year</span>
                <span className='font-medium'>{car.year}</span>
              </div>
              <div className='flex justify-between py-2 '>
                <span className='text-gray-600'>Body Type</span>
                <span className='font-medium'>{car.bodyType}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600'>Fuel Type</span>
                <span className='font-medium'>{car.fuelType}</span>
              </div>
              <div className='flex justify-between py-2 '>
                <span className='text-gray-600'>Transmission</span>
                <span className='font-medium'>{car.transmission}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600'>Mileage</span>
                <span className='font-medium'>
                  {car.mileage.toLocaleString()} miles
                </span>
              </div>
              <div className='flex justify-between py-2 '>
                <span className='text-gray-600'>Color</span>
                <span className='font-medium'>{car.color}</span>
              </div>
              {car.seats && (
                <div className='flex justify-between py-2 '>
                  <span className='text-gray-600'>Seats</span>
                  <span className='font-medium'>{car.seats}</span>
                </div>
              )}
            </div>

            {/* Show More Button */}
            <div className='text-center mt-4'>
              <button
                className='text-blue-600 hover:underline text-sm font-medium'
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dealership Location Section */}
      <div className='mt-8 p-6 bg-white rounded-lg shadow-sm'>
        <h2 className='text-2xl font-bold mb-6'>Dealership Location</h2>
        <div className='bg-gray-50 rounded-lg p-6'>
          <div className='flex flex-col md:flex-row gap-6 justify-between'>
            {/* Dealership Name and Address */}
            <div className='flex items-start gap-3'>
              <LocateFixed className='h-5 w-5 text-blue-600 mt-1 flex-shrink-0' />
              <div>
                <h4 className='font-medium'>Vehiql Motors</h4>
                <p className='text-gray-600'>
                  {testDriveInfo.dealership?.address || 'Not Available'}
                </p>
                <p className='text-gray-600 mt-1'>
                  Phone: {testDriveInfo.dealership?.phone || 'Not Available'}
                </p>
                <p className='text-gray-600'>
                  Email: {testDriveInfo.dealership?.email || 'Not Available'}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className='md:w-1/2 lg:w-1/3'>
              <h4 className='font-medium mb-2'>Working Hours</h4>
              <div className='space-y-2'>
                {testDriveInfo.dealership?.workingHours
                  ? testDriveInfo.dealership.workingHours
                      .sort((a, b) => {
                        const days = [
                          'MONDAY',
                          'TUESDAY',
                          'WEDNESDAY',
                          'THURSDAY',
                          'FRIDAY',
                          'SATURDAY',
                          'SUNDAY',
                        ];
                        return (
                          days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
                        );
                      })
                      // after sorting we will be doing a map fucntion  to render the data
                      .map((day) => (
                        <div
                          key={day.dayOfWeek}
                          className='flex justify-between text-sm'
                        >
                          <span className='text-gray-600'>
                            {day.dayOfWeek.charAt(0) +
                              day.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          <span>
                            {day.isOpen
                              ? `${day.openTime} - ${day.closeTime}`
                              : 'Closed'}
                          </span>
                        </div>
                      ))
                  : // Default hours if none provided
                    //  if no days added we can use this data
                    [
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((day, index) => (
                      <div key={day} className='flex justify-between text-sm'>
                        <span className='text-gray-600'>{day}</span>
                        <span>
                          {index < 5
                            ? '9:00 - 18:00'
                            : index === 5
                            ? '10:00 - 16:00'
                            : 'Closed'}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;
