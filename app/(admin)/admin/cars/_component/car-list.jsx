'use client';
import { deleteCars, getCars, updateCarsStatus } from '@/actions/cars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useFetch from '@/hooks/use-fetch';
import { formatCurrency } from '@/lib/helper';
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CarList = () => {
  const [search, setSearch] = useState('');
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  //call the api from the server action that we create
  const {
    loading: loadingCars,
    data: carsData,
    fn: fetchCars,
    error: carsError,
  } = useFetch(getCars);
  console.log('data', carsData);

  //import deletecar server action
  const {
    loading: deletingCar,
    data: deleteResult,
    fn: deleteCarFn,
    error: deleteError,
  } = useFetch(deleteCars);

  console.log('delete', deleteResult);
  //import update car server action

  const {
    loading: updatingCar,
    data: updateResult,
    fn: updateCarStatusFn,
    error: updateError,
  } = useFetch(updateCarsStatus);

  //fetching the data which searching
  useEffect(() => {
    fetchCars(search);
  }, [search]);

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
            Available
          </Badge>
        );
      case 'UNAVAILABLE':
        return (
          <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
            Unavailable
          </Badge>
        );
      case 'SOLD':
        return (
          <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
            Sold
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };
  //this is for toggling the car is featureed or not
  //here we are using updatingcarfn fromm the service action file

  const handleToggleFeatured = async (car) => {
    //we need to provide the carid and also negate the featured value.ie if car featureed make it not featured and wise versa
    await updateCarStatusFn(car.id, { featured: !car.featured });
  };

  //updating the status
  const handleStatusUpdate = async (car, newStatus) => {
    //we need to provide the carid and also negate the featured value.ie if car featureed make it not featured and wise versa
    await updateCarStatusFn(car.id, { status: newStatus });
  };

  //delete the car
  //deleting the car we will show dialogue box

  const handleDeleteCar = async () => {
    // if there is no car to delete
    if (!carToDelete) return;
    //call the server action function
    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Handle successful operations
  //if the update result changes it will call this useEffect
  //if we havnt given this useeffect nammalk page refresh cheyendi verum update kaanan
  useEffect(() => {
    if (deleteResult?.success) {
      toast.success('Car deleted successfully');
      fetchCars(search);
    }

    if (updateResult?.success) {
      toast.success('Car updated successfully');
      fetchCars(search);
    }
  }, [updateResult, deleteResult]);

  // handle errors
  useEffect(() => {
    if (carsError) {
      toast.error('Failed to load cars');
    }

    if (deleteError) {
      toast.error('Failed to delete car');
    }

    if (updateError) {
      toast.error('Failed to update car');
    }
  }, [carsError, deleteError, updateError]);

  //this is for search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars(search);
    //api call
  };
  return (
    <div className='space-y-4'>
      <div className=' ap-4 flex flex-col sm:flex-row items-start sm:items-center justify-between'>
        <Button
          className='flex items-center'
          onClick={() => router.push('/admin/cars/create')}
        >
          <Plus className='h-4 w-4' />
          Add Car
        </Button>

        {/* form for searching the car in the table */}
        <form className='flex w-full sm:w-auto' onSubmit={handleSearchSubmit}>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
            <Input
              type='search'
              onChange={(e) => setSearch(e.target.value)}
              placeholder='search cars... '
              value={search}
              className='w-full pl-9 sm:w-60'
            />
          </div>
        </form>
      </div>

      {/* render our carlist */}
      {/* cars table */}

      <Card>
        <CardContent className='p-0'>
          {loadingCars && !carsData ? (
            <div className='flex justify-center items-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : // if the cardata is success and data i present show the table else show the message
          carsData?.success && carsData.data.length > 0 ? (
            <div className='overflow-x-auto'>
              {/* here we will render the table */}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData?.data?.map((car) => {
                    console.log('cardata', carsData);
                    return (
                      <TableRow key={car?.id}>
                        {/* we are showing image here */}
                        <TableCell>
                          <div className='w-10 h-10 rounded-md overflow-hidden'>
                            {car?.images && car?.images?.length > 0 ? (
                              <Image
                                src={car?.images[0]}
                                alt={`${car?.make} ${car?.model}`}
                                height={40}
                                width={40}
                                className='w-full h-full object-cover'
                                priority
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                <CarIcon className='h-6 w-6 text-gray-400' />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {car?.make} {car?.model}
                        </TableCell>

                        <TableCell>{car?.year}</TableCell>
                        {/* we need to format the price using the helper function */}
                        <TableCell>{formatCurrency(car?.price)}</TableCell>

                        {/* carstatus */}
                        {/* if we directly choose the status it will be plain text. we need add some styles for this */}

                        {/* for that we are writing a function and use the style accordingly */}
                        <TableCell>{getStatusBadge(car?.status)}</TableCell>

                        {/* check the car is featured or not */}
                        <TableCell>
                          <Button
                            className='p-0 h-9 w-9'
                            variant='ghost'
                            size='sm'
                            onClick={() => handleToggleFeatured(car)}
                            disabled={updatingCar}
                          >
                            {car.featured ? (
                              <Star className='h-5 w-5 text-amber-500 fill-amber-500' />
                            ) : (
                              <StarOff className='h-5 w-5 text-gray-400' />
                            )}
                          </Button>
                        </TableCell>

                        {/* adding drop down menu so that we can perform different option */}

                        <TableCell className='text-right'>
                          <DropdownMenu>
                            {/* ethill ulla button ee trigerm ore functionality aaka click cheyumpo */}
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='p-0 h-8 w-8'
                              >
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              {/* used for view the car */}
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {/* label */}
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, 'AVAILABLE')
                                }
                                disabled={
                                  car.status === 'AVAILABLE' || updatingCar
                                }
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, 'UNAVAILABLE')
                                }
                                disabled={
                                  car.status === 'UNAVAILABLE' || updatingCar
                                }
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(car, 'SOLD')}
                                disabled={car.status === 'SOLD' || updatingCar}
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-red-500'
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <CarIcon className='h-12 w-12 text-gray-300 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                No cars found
              </h3>
              <p className='text-gray-500 mb-4'>
                {/* if there is no search result show this message */}
                {search
                  ? 'No cars match your search criteria'
                  : 'Your inventory is empty. Add cars to get started.'}
              </p>
              <Button
                className='cursor-pointer'
                onClick={() => router.push('/admin/cars/create')}
              >
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* model box */}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToDelete?.make}{' '}
              {carToDelete?.model} ({carToDelete?.year})? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
            >
              Cancel
            </Button>
            {/* deleting car */}
            <Button
              variant='destructive'
              // function that we created gettriggered
              onClick={handleDeleteCar}
              disabled={deletingCar}
            >
              {deletingCar ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Car'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarList;
