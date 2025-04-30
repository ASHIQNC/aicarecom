'use client';
import { getAdminTestDrives, updatetestDriveStatus } from '@/actions/admin';
import { cancelTestDrive } from '@/actions/test-drive';
import TestDriveCard from '@/components/test-drive-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFetch from '@/hooks/use-fetch';
import { AlertCircle, CalendarRange, Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TestDriveList = () => {
  //we will have the filter state for search and status filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  //gett the server action
  // Custom hooks for API calls
  const {
    loading: fetchingTestDrives,
    fn: fetchTestDrives,
    data: testDrivesData,
    error: testDrivesError,
  } = useFetch(getAdminTestDrives);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updatetestDriveStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  //fetch all the testdrive after the component has loadeed
  useEffect(() => {
    fetchTestDrives({ search, status: statusFilter });
  }, [search, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (testDrivesError) {
      toast.error('Failed to load test drives');
    }
    if (updateError) {
      toast.error('Failed to update test drive status');
    }
    if (cancelError) {
      toast.error('Failed to cancel test drive');
    }
  }, [testDrivesError, updateError, cancelError]);

  //success conditon for updating and canceling
  // Handle successful operations
  useEffect(() => {
    if (updateResult?.success) {
      toast.success('Test drive status updated successfully');
      //after the toast and fetch the updated the result
      fetchTestDrives({ search, status: statusFilter });
    }
    if (cancelResult?.success) {
      toast.success('Test drive cancelled successfully');
      fetchTestDrives({ search, status: statusFilter });
    }
  }, [updateResult, cancelResult]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTestDrives({ search, status: statusFilter });
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    //if newStatus has something then trigger the update function
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus);
    }
  };

  return (
    <div>
      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-4 w-full'>
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className='w-full sm:w-48'
          >
            <SelectTrigger>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>All Statuses</SelectItem>
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
              <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              <SelectItem value='NO_SHOW'>No Show</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className='flex w-full'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search by car or customer...'
                className='pl-9 w-full'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type='submit' className='ml-2'>
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* here we will be rendering all the testdrive */}

      <Card className='mt-4'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarRange className='h-5 w-5' />
            Test Drive Bookings
          </CardTitle>
          <CardDescription>
            Manage all test drive reservations and update their status
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* check the fetching testdrive currenlt and if there is no testdrivedata we will show the loader */}

          {fetchingTestDrives && !testDrivesData ? (
            <div className='flex justify-center items-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : testDrivesError ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load test drives. Please try again.
              </AlertDescription>
            </Alert>
          ) : testDrivesData?.data?.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <CalendarRange className='h-12 w-12 text-gray-300 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                No test drives found
              </h3>
              <p className='text-gray-500 mb-4'>
                {statusFilter || search
                  ? 'No test drives match your search criteria'
                  : 'There are no test drive bookings yet.'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {testDrivesData?.data?.map((booking) => (
                <div key={booking.id} className='relative'>
                  <TestDriveCard
                    booking={booking}
                    onCancel={cancelTestDriveFn}
                    //   only show action if testdrive is pending or confirmed
                    showActions={['PENDING', 'CONFIRMED'].includes(
                      booking.status
                    )}
                    isAdmin={true}
                    //   will show canceling loader
                    isCancelling={cancelling}
                    cancelError={cancelError}
                    //this will aloow us to change the status
                    //here render props  is most important part of react that is,
                    //we are basically supplying the component throught the props

                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className='w-full h-8'>
                          <SelectValue placeholder='Update Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='PENDING'>Pending</SelectItem>
                          <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
                          <SelectItem value='COMPLETED'>Completed</SelectItem>
                          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                          <SelectItem value='NO_SHOW'>No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDriveList;
