'use client';
import { getCars } from '@/actions/car-listing';
import useFetch from '@/hooks/use-fetch';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CarListingsLoading from './car-listings-loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CarCard from '@/components/car-card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const CarListing = () => {
  // we need get the search params
  //also the server action for fetching the data
  const searchParams = useSearchParams();
  const router = useRouter();
  //state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  // loading
  const [isPaginating, setIsPaginating] = useState(false);

  const limit = 6;

  // Extract filter values from searchParams
  const search = searchParams.get('search') || '';
  const make = searchParams.get('make') || '';
  const bodyType = searchParams.get('bodyType') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const minPrice = searchParams.get('minPrice') || 0;
  const maxPrice = searchParams.get('maxPrice') || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);
  console.log('result', result);

  //inside the useEffect we need to call the function to fetch the cars

  // Fetch cars when filters change
  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    }).finally(() => {
      setIsPaginating(false); // Reset pagination loading
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  /// Update URL when current  page changes
  useEffect(() => {
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set('page', currentPage.toString());
      router.push(`?${params.toString()}`);
    }
  }, [currentPage, router, searchParams, page]);

  //show a loading indicator when we are fetching the data
  if ((loading && !result) || isPaginating) {
    return <CarListingsLoading />;
  }

  // Handle error
  if (error || (result && !result?.success)) {
    return (
      <Alert variant='destructive'>
        <Info className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Handle pagination clicks
  const handlePageChange = (pageNum) => {
    setIsPaginating(true);
    setCurrentPage(pageNum);
  };

  // Generate pagination URL and set on the url
  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNum.toString());
    return `?${params.toString()}`;
  };

  // also we need to check if we have somthing in reult or not
  if (!result || !result?.data) {
    return null;
  }

  //take the data from the result
  const { data: cars, pagination } = result;

  // if the number of cars is zero we need to show some message

  // No results
  if (cars.length === 0) {
    return (
      <div className='min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50'>
        <div className='bg-gray-100 p-4 rounded-full mb-4'>
          <Info className='h-8 w-8 text-gray-500' />
        </div>
        <h3 className='text-lg font-medium mb-2'>No cars found</h3>
        <p className='text-gray-500 mb-6 max-w-md'>
          We couldn't find any cars matching your search criteria. Try adjusting
          your filters or search term.
        </p>
        <Button variant='outline' asChild>
          <Link href='/car'>Clear all filters</Link>
        </Button>
      </div>
    );
  }

  // // Generate pagination items
  // const paginationItems = [];

  // // Calculate which page numbers to show (first, last, and around current page)
  // const visiblePageNumbers = [];

  // // Always show page 1
  // visiblePageNumbers.push(1);

  // // Show pages around current page
  // for (
  //   let i = Math.max(2, page - 1);
  //   i <= Math.min(pagination.pages - 1, page + 1);
  //   i++
  // ) {
  //   visiblePageNumbers.push(i);
  // }

  // // Always show last page if there's more than 1 page
  // if (pagination.pages > 1) {
  //   visiblePageNumbers.push(pagination.pages);
  // }

  // // Sort and deduplicate
  // const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
  //   (a, b) => a - b
  // );

  // // Create pagination items with ellipses
  // let lastPageNumber = 0;
  // uniquePageNumbers.forEach((pageNumber) => {
  //   if (pageNumber - lastPageNumber > 1) {
  //     // Add ellipsis
  //     paginationItems.push(
  //       <PaginationItem key={`ellipsis-${pageNumber}`}>
  //         <PaginationEllipsis />
  //       </PaginationItem>
  //     );
  //   }

  //   paginationItems?.push(
  //     <PaginationItem key={pageNumber}>
  //       <PaginationLink
  //         href={getPaginationUrl(pageNumber)}
  //         isActive={pageNumber === page}
  //         onClick={(e) => {
  //           e.preventDefault();
  //           handlePageChange(pageNumber);
  //         }}
  //       >
  //         {pageNumber}
  //       </PaginationLink>
  //     </PaginationItem>
  //   );

  //   lastPageNumber = pageNumber;
  // });

  // Generate pagination items array which will hold JSX elements for page links and ellipses
  const paginationItems = [];

  // This array will temporarily store which page numbers we want to show
  const visiblePageNumbers = [];

  // Always show the first page (page 1)
  visiblePageNumbers.push(1);

  // Show pages around the current page (e.g., currentPage - 1, currentPage, currentPage + 1)
  // But avoid going below 2 and above the second last page
  for (
    let i = Math.max(2, page - 1); // start from page-1 or 2 (whichever is higher)
    i <= Math.min(pagination.pages - 1, page + 1); // end at page+1 or second-last page
    i++
  ) {
    visiblePageNumbers.push(i);
  }

  // Always show the last page (but only if there are more than one page)
  if (pagination.pages > 1) {
    visiblePageNumbers.push(pagination.pages);
  }

  // Remove any duplicate page numbers and sort them in ascending order
  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
    (a, b) => a - b
  );

  // Track the last page number we rendered so we can add ellipses if there's a gap
  let lastPageNumber = 0;

  // Loop through each visible page number
  uniquePageNumbers.forEach((pageNumber) => {
    // If there's a gap between this and the last rendered page number, add an ellipsis (...)
    if (pageNumber - lastPageNumber > 1) {
      paginationItems.push(
        <PaginationItem key={`ellipsis-${pageNumber}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add the actual page number as a clickable pagination link
    paginationItems.push(
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={getPaginationUrl(pageNumber)} // generates the URL with ?page=x
          isActive={pageNumber === page} // highlight the current page
          onClick={(e) => {
            e.preventDefault(); // prevent full page reload
            handlePageChange(pageNumber); // update the current page
          }}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );

    // Update lastPageNumber so we can detect gaps for ellipses next time
    lastPageNumber = pageNumber;
  });

  return (
    <div>
      {/* we can show what page we are currently in */}
      <div className='flex justify-between items-center mb-6'>
        <p className='text-gray-600'>
          Showing{' '}
          <span className='font-medium'>
            {/* this will show from where to where we are rendering */}
            {/* example 1-6 this is how below code will look like */}
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination?.total)}
          </span>{' '}
          of <span className='font-medium'>{pagination?.total}</span> cars
        </p>
      </div>

      {/* our cars section */}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {cars?.map((car) => {
          console.log('car', car);
          return <CarCard key={car?.id} car={car} />;
        })}
      </div>

      {/* pagination */}
      <div>
        {pagination.pages > 1 && (
          <Pagination className='mt-10'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={getPaginationUrl(page - 1)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) {
                      handlePageChange(page - 1);
                    }
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {paginationItems}

              <PaginationItem>
                <PaginationNext
                  href={getPaginationUrl(page + 1)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < pagination.pages) {
                      handlePageChange(page + 1);
                    }
                  }}
                  className={
                    page >= pagination.pages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default CarListing;
