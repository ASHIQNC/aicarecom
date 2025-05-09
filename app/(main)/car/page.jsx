import { getCarFilters } from '@/actions/car-listing';
import React from 'react';
import CarFilters from './_components/car-filter';
import CarListing from './_components/car-listing';

export const metadata = {
  title: 'Cars | Vehiql',
  description: 'Browse and search for your dream car',
};

const CarsPage = async () => {
  const filterData = await getCarFilters();
  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-6xl mb-4 gradient-title'>Browse Cars</h1>

      <div className='flex flex-col lg:flex-row gap-4'>
        {/* filters */}
        <div className='w-full lg:w-80 flex-shrink-0'>
          <CarFilters filters={filterData.data} />
        </div>

        {/* listing */}
        {/* willl take all the remaining space */}
        <div className='flex-1'>
          <CarListing />
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
