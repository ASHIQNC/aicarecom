'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { CarIcon, Heart, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/use-fetch';
import { toggleSavedCars } from '@/actions/car-listing';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

const CarCard = ({ car }) => {
  const [saved, setSaved] = useState(car.wishlisted);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  // add to wishlist or saved cars
  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCars);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== saved) {
      setSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, saved]);
  console.log('saved', saved);

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error('Failed to update favorites');
    }
  }, [toggleError]);

  //toggling in save or not save
  const handleToggleSave = async (e) => {
    e.preventDefault();

    // check whhether the user is signedIn or not
    if (!isSignedIn) {
      toast.error('Please sign in to save cars');
      router.push('/sign-in');
      return;
    }

    //check whether already save or not if yes return nothing
    if (isToggling) return;

    //if not call the togglesaved cars
    try {
      await toggleSavedCarFn(car?.id);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };
  return (
    <Card className='overflow-hidden hover:shadow-lg transition group py-0'>
      <div className='relative h-48'>
        {car.images && car.images.length > 0 ? (
          <div className='relative w-full h-full'>
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className='object-cover group-hover:scale-105 transition duration-300'
            />
          </div>
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
            <CarIcon className='h-12 w-12 text-gray-400' />
          </div>
        )}
        <Button
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            saved
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          variant='ghost'
          size='icon'
          onClick={handleToggleSave}
        >
          {isToggling ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Heart size={20} className={saved ? 'fill-current' : ''} />
          )}
        </Button>
      </div>
      <CardContent className='p-4'>
        <h3>
          {car.make} {car.model}
        </h3>
        <span>${car.price}</span>

        <div className='text-gray-600 mb-2 flex items-center'>
          <span>{car.year}</span>
          <span className='mx-2'>•</span>
          <span>{car.transmission}</span>
          <span className='mx-2'>•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className='flex flex-wrap gap-1 mb-4'>
          <Badge variant='outline' className='bg-gray-50'>
            {car.bodyType}
          </Badge>
          <Badge variant='outline' className='bg-gray-50'>
            {car?.mileage} miles
          </Badge>
          <Badge variant='outline' className='bg-gray-50'>
            {car.color}
          </Badge>
        </div>

        <div className='flex justify-between '>
          <Button
            className='flex-1 cursor-pointer'
            onClick={() => {
              router.push(`/car/${car.id}`);
            }}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
