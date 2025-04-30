'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, Sliders, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import CarFilterControls from './filter-controller';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CarFilters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //now we need to get all the value from search paramss
  //that is model,bodytype, price etc

  // Get current filter values from searchParams
  const currentMake = searchParams.get('make') || '';
  const currentBodyType = searchParams.get('bodyType') || '';
  const currentFuelType = searchParams.get('fuelType') || '';
  const currentTransmission = searchParams.get('transmission') || '';
  const currentMinPrice = searchParams.get('minPrice')
    ? parseInt(searchParams.get('minPrice'))
    : filters.priceRange.min;
  const currentMaxPrice = searchParams.get('maxPrice')
    ? parseInt(searchParams.get('maxPrice'))
    : filters.priceRange.max;
  const currentSortBy = searchParams.get('sortBy') || 'newest';

  //we will be creating all the state for the filter to store the value
  // Local state for filters
  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  //sheet means the drawer
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  //when ever the url parameter changes we need to update the state paramss as well
  // Update local state when URL parameters change
  useEffect(() => {
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentMake,
    currentBodyType,
    currentFuelType,
    currentTransmission,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  //we need to show how many filter has been selected
  //some of the value can be null so  we are filtering and checking the true values length
  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filters.priceRange.min ||
      currentMaxPrice < filters.priceRange.max,
  ].filter(Boolean).length;

  // Current filters object for the controls component
  //we are providing what ever filters we have
  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,
    priceRangeMin: filters.priceRange.min,
    priceRangeMax: filters.priceRange.max,
  };

  //fucntion for applying the fillter
  // this will take the filter name and the new value for the filter
  const handleFilterchange = (filterName, value) => {
    //here we are using switch case
    // filter name "make aanel" set the value to make
    switch (filterName) {
      case 'make':
        setMake(value);
        break;
      case 'bodyType':
        setBodyType(value);
        break;
      case 'fuelType':
        setFuelType(value);
        break;
      case 'transmission':
        setTransmission(value);
        break;
      case 'priceRange':
        setPriceRange(value);
        break;
    }
  };

  //accept the filter and clear the filter
  const handleClearFilter = (filterName) => {
    //use the filter name and pass value as empty
    handleFilterchange(filterName, '');
  };

  // clear filter button
  //this will allow us to clear the filter all at once
  // Clear all filters
  const clearFilters = () => {
    setMake('');
    setBodyType('');
    setFuelType('');
    setTransmission('');
    setPriceRange([filters.priceRange.min, filters.priceRange.max]);
    setSortBy('newest');

    // Keep search term if exists
    //we need to clear the search params as well
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    //if search is there we need to keep that there
    //we dont need to clear the search value we need ti clear the filter values
    if (search) params.set('search', search);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  };

  // const applyFilters =
  //   (() => {
  //     const params = new URLSearchParams();
  //     //while applying the filters first we nneeed to set the value in the url
  //     if (make) params.set('make', make);
  //     if (bodyType) params.set('bodyType', bodyType);
  //     if (fuelType) params.set('fuelType', fuelType);
  //     if (transmission) params.set('transmission', transmission);
  //     if (priceRange[0] > filters.priceRange.min)
  //       params.set('minPrice', priceRange[0].toString());
  //     if (priceRange[1] < filters.priceRange.max)
  //       params.set('maxPrice', priceRange[1].toString());
  //     if (sortBy !== 'newest') params.set('sortBy', sortBy);

  //     // Preserve search and page params if they exist
  //     //if we have usersearch and page we need to keep that as well
  //     const search = searchParams.get('search');
  //     const page = searchParams.get('page');
  //     if (search) params.set('search', search);
  //     if (page && page !== '1') params.set('page', page);

  //     //last we set our query
  //     const query = params.toString();
  //     const url = query ? `${pathname}?${query}` : pathname;

  //     router.push(url);
  //     setIsSheetOpen(false);
  //   },
  //   [
  //     make,
  //     bodyType,
  //     fuelType,
  //     transmission,
  //     priceRange,
  //     sortBy,
  //     pathname,
  //     searchParams,
  //     filters.priceRange.min,
  //     filters.priceRange.max,
  //   ]);
  // const applyFilters = () => {
  //   const params = new URLSearchParams();

  //   if (make) params.set('make', make);
  //   if (bodyType) params.set('bodyType', bodyType);
  //   if (fuelType) params.set('fuelType', fuelType);
  //   if (transmission) params.set('transmission', transmission);
  //   if (priceRange[0] > filters.priceRange.min)
  //     params.set('minPrice', priceRange[0].toString());
  //   if (priceRange[1] < filters.priceRange.max)
  //     params.set('maxPrice', priceRange[1].toString());
  //   if (sortBy !== 'newest') params.set('sortBy', sortBy);

  //   const search = searchParams.get('search');
  //   const page = searchParams.get('page');
  //   if (search) params.set('search', search);
  //   if (page && page !== '1') params.set('page', page);

  //   const query = params.toString();
  //   const url = query ? `${pathname}?${query}` : pathname;

  //   router.push(url);
  //   setIsSheetOpen(false);
  // };

  const applyFilters = () => {
    const params = new URLSearchParams();

    // Only set if not empty
    if (make.trim()) params.set('make', make.trim());
    if (bodyType.trim()) params.set('bodyType', bodyType.trim());
    if (fuelType.trim()) params.set('fuelType', fuelType.trim());
    if (transmission.trim()) params.set('transmission', transmission.trim());

    // Only set price if changed from default
    if (priceRange[0] > filters.priceRange.min)
      params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < filters.priceRange.max)
      params.set('maxPrice', priceRange[1].toString());

    // Only set sortBy if it's not the default
    if (sortBy !== 'newest') params.set('sortBy', sortBy);

    // Preserve existing `search` and `page`
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    if (search?.trim()) params.set('search', search.trim());
    if (page && page !== '1') params.set('page', page);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  };

  // Run applyFilters whenever sortBy changes
  useEffect(() => {
    applyFilters();
  }, [
    sortBy,
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,

    pathname,
    searchParams,
  ]);

  return (
    <div className='flex lg:flex-col justify-between gap-4'>
      {/* mobile ui filter */}
      <div className='lg:hidden mb-4'>
        <div className='flex items-center'>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' className='flex items-center gap-2'>
                <Filter className='h-4 w-4' />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className='ml-1 h-5 w-5 rounded-full p-0 items-center justify-center'>
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side='left'
              className='w-full sm:max-w-md overflow-y-auto'
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              {/* filters content */}

              <div className='py-6'>
                {/* common components for mobile and desktop */}
                <CarFilterControls
                  filters={filters}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterchange}
                  onClearFilters={handleClearFilter}
                />
              </div>

              <SheetFooter className='sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={clearFilters}
                  className='flex-1'
                >
                  Reset
                </Button>
                <Button type='button' onClick={applyFilters} className='flex-1'>
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* sort selection */}
      <Select
        value={sortBy}
        //we are setting the value on onChange
        onValueChange={(value) => {
          setSortBy(value);
          // Apply filters immediately when sort changes
          // setTimeout(() => applyFilters(), 0);
        }}
      >
        <SelectTrigger className='w-[180px] lg:w-full'>
          <SelectValue placeholder='Sort by' />
        </SelectTrigger>

        <SelectContent>
          {[
            { value: 'newest', label: 'Newest First' },
            { value: 'priceAsc', label: 'Price: Low to High' },
            { value: 'priceDesc', label: 'Price: High to Low' },
          ].map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* desktop filter */}

      <div className='hidden lg:block sticky top-24'>
        <div className=' border rounded-lg overflow-hidden bg-white'>
          <div className='p-4 border-b bg-gray-50 flex justify-between items-center'>
            <h3 className='font-medium flex items-center'>
              <Sliders className='mr-2 h-4 w-4' />
              Filters
            </h3>

            {activeFilterCount > 0 && (
              <Button
                onClick={clearFilters}
                variant='ghost'
                size='sm'
                className='h-8 text-sm text-gray-600'
              >
                <X /> Clear All
              </Button>
            )}
          </div>
          <div className='p-4'>
            <CarFilterControls
              filters={filters}
              currentFilters={currentFilters}
              onFilterChange={handleFilterchange}
              onClearFilters={handleClearFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarFilters;
