'use client';

import { bookTestDrive } from '@/actions/test-drive';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/use-fetch';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO, startOfDay } from 'date-fns';

import { CalendarIcon, Car, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

//first we need to create a schema for the zod
// Define Zod schema for form validation
const testDriveSchema = z.object({
  date: z.date({
    required_error: 'Please select a date for your test drive',
  }),
  timeSlot: z.string({
    required_error: 'Please select a time slot',
  }),
  // notes is optional
  notes: z.string().optional(),
});

const TestDriveForm = ({ car, testDriveInfo }) => {
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Custom hooks for API calls
  const {
    loading: bookingInProgress,
    fn: bookTestDriveFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookTestDrive);
  console.log('booking re', bookingResult);

  // here we are using "react hook form with zod" for creating the form
  //useForm hook from react hook form.UseForm will prdovide few things such as,     control,
  // handleSubmit,
  // watch,
  // setValue,
  // reset,
  // formState: { errors, isValid },
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    // also we can provide the default value
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: '',
    },
  });

  const dealership = testDriveInfo?.dealership;

  //check whether there is existing booking or not
  const existingBookings = testDriveInfo?.existingBookings || [];

  //for date field we need to monitor the date field using "watch"
  //thatis because when the date field is selected only then we are showing the time slot
  const selectDate = watch('date');

  // Create a function to determine which days should be disabled
  const isDayDisabled = (day) => {
    // Disable past dates
    if (day < new Date()) {
      return true;
    }

    // Get day of week
    //we also need to disable on week days as well that is sunday
    const dayOfWeek = format(day, 'EEEE').toUpperCase();

    // Find working hours for the day
    const daySchedule = dealership?.workingHours?.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    // Disable if dealership is closed on this day
    return !daySchedule || !daySchedule.isOpen;
  };

  //this useEffect will only working if any of the dependencies changes
  useEffect(() => {
    //if the date is not selected or there is no working hours simply return
    if (!selectDate || !dealership?.workingHours) return;

    //get the selected day of the weak
    const selectedDayOfWeek = format(selectDate, 'EEEE').toUpperCase();

    // Find working hours for the selected day
    const daySchedule = dealership.workingHours.find(
      (day) => day.dayOfWeek === selectedDayOfWeek
    );

    //if there is no day schedule or the working hour is not open return empty
    if (!daySchedule || !daySchedule.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }

    //then we can pass the open and closing hours
    const openHour = parseInt(daySchedule?.openTime.split(':')[0]);
    const closeHour = parseInt(daySchedule?.closeTime.split(':')[0]);

    // Generate time slots (every hour)
    const slots = [];
    //this looop will go from open hour to close hour
    for (let hour = openHour; hour < closeHour; hour++) {
      // padStart:is used to truncate the string if it is too long
      //padStart(2, "0")}:00` =in this we only need two digit

      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if this slot is already booked
      const isBooked = existingBookings.some((booking) => {
        const bookingDate = booking.date;
        return (
          bookingDate === format(selectDate, 'yyyy-MM-dd') &&
          (booking.startTime === startTime || booking.endTime === endTime)
        );
      });

      //if it is not book we can add it in the slot
      if (!isBooked) {
        slots.push({
          id: `${startTime}-${endTime}`,
          label: `${startTime} - ${endTime}`,
          startTime,
          endTime,
        });
      }
    }

    setAvailableTimeSlots(slots);
    setValue('timeSlot', '');
  }, [selectDate]);

  // Handle successful booking
  //this useEffect will be useFull when we render the dialogue box
  useEffect(() => {
    if (bookingResult?.success) {
      setBookingDetails({
        date: format(bookingResult?.data?.bookingDate, 'EEEE, MMMM d, yyyy'),
        timeSlot: `${format(
          parseISO(`2022-01-01T${bookingResult?.data?.startTime}`),
          'h:mm a'
        )} - ${format(
          parseISO(`2022-01-01T${bookingResult?.data?.endTime}`),
          'h:mm a'
        )}`,
        notes: bookingResult?.data?.notes,
      });
      setShowConfirmation(true);

      // Reset form
      reset();
    }
  }, [bookingResult]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      toast.error(
        bookingError.message || 'Failed to book test drive. Please try again.'
      );
    }
  }, [bookingError]);

  const onSubmit = async (data) => {
    //check whether slot is avaialable or not

    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.id === data.timeSlot
    );

    if (!selectedSlot) {
      toast.error('Selected time slot is not available');
      return;
    }

    await bookTestDriveFn({
      carId: car.id,
      bookingDate: format(data.date, 'yyyy-MM-dd'),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: data.notes || '',
    });
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/car/${car.id}`);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
      <div className='md:col-span-1'>
        <Card>
          <CardContent className='p-6'>
            <h2 className='text-xl font-bold mb-4'>Car Details</h2>

            <div className='aspect-video rounded-lg overflow-hidden relative mb-4'>
              {car?.images && car?.images.length > 0 ? (
                <img
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className='object-cover w-full h-full'
                />
              ) : (
                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                  <Car className='h-12 w-12 text-gray-400' />
                </div>
              )}
            </div>

            {/* car details */}
            <h3 className='text-lg font-bold'>
              {car?.year} {car?.make} {car?.model}
            </h3>

            <div className='mt-2 text-xl font-bold text-blue-600'>
              ${new Intl.NumberFormat('en-US').format(car?.price || 0)}
            </div>

            <div className='mt-4 text-sm text-gray-500'>
              <div className='flex justify-between py-1 border-b'>
                <span>Mileage</span>
                <span className='font-medium'>
                  {car?.mileage.toLocaleString()} miles
                </span>
              </div>
              <div className='flex justify-between py-1 border-b'>
                <span>Fuel Type</span>
                <span className='font-medium'>{car?.fuelType}</span>
              </div>
              <div className='flex justify-between py-1 border-b'>
                <span>Transmission</span>
                <span className='font-medium'>{car?.transmission}</span>
              </div>
              <div className='flex justify-between py-1 border-b'>
                <span>Body Type</span>
                <span className='font-medium'>{car?.bodyType}</span>
              </div>
              <div className='flex justify-between py-1'>
                <span>Color</span>
                <span className='font-medium'>{car?.color}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* delearship info */}

        <Card className='mt-6'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-bold mb-4'>Dealership Info</h2>
            <div className='text-sm'>
              <p className='font-medium'>
                {dealership?.name || 'Vehiql Motors'}
              </p>
              <p className='text-gray-600 mt-1'>
                {dealership?.address || 'Address not available'}
              </p>
              <p className='text-gray-600 mt-3'>
                <span className='font-medium'>Phone:</span>{' '}
                {dealership?.phone || 'Not available'}
              </p>
              <p className='text-gray-600'>
                <span className='font-medium'>Email:</span>{' '}
                {dealership?.email || 'Not available'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* form */}

      <div className='md:col-span-2'>
        <Card>
          <CardContent>
            {/* form */}
            <h2>Schedule Your Test Drive</h2>
            {/* handlesubmit comes from reacthooks form */}
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
              {/* Date Selection */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium'>
                  Select a Date
                </label>
                {/* we are using controller from react hook form since popover is a thirdparty component */}
                <Controller
                  name='date'
                  //controll variable will give control over over form
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            // cn used to render conditionally the classes
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value
                              ? format(field.value, 'PPP') //ppp will return the date in this format April 29th, 1998
                              : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                          {/*calender component from shadcn ui  */}
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className='text-sm font-medium text-red-500 mt-1'>
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* time slots */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium'>
                  Select a Time Slot
                </label>

                <Controller
                  name='timeSlot'
                  //controll variable will give control over over form
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          !selectDate || availableTimeSlots.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectDate
                                ? 'Please select a date first'
                                : availableTimeSlots.length === 0
                                ? 'No available slots on this date'
                                : 'Select a time slot'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {errors.timeSlot && (
                        <p className='text-sm font-medium text-red-500 mt-1'>
                          {errors?.timeSlot?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Notes */}

              <div className='space-y-2'>
                <label className='block text-sm font-medium'>
                  Additional Notes (Optional)
                </label>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder='Any specific questions or requests for your test drive?'
                      className='min-h-24'
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full'
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Booking Your Test Drive...
                  </>
                ) : (
                  'Book Test Drive'
                )}
              </Button>
            </form>

            {/* show some  instruction if needed his is optional */}
            <div className='mt-8 bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>What to expect</h3>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex items-start'>
                  <CheckCircle2 className='h-4 w-4 text-green-500 mr-2 mt-0.5' />
                  Bring your driver's license for verification
                </li>
                <li className='flex items-start'>
                  <CheckCircle2 className='h-4 w-4 text-green-500 mr-2 mt-0.5' />
                  Test drives typically last 30-60 minutes
                </li>
                <li className='flex items-start'>
                  <CheckCircle2 className='h-4 w-4 text-green-500 mr-2 mt-0.5' />
                  A dealership representative will accompany you
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* this will only open when showConfirmation State is true */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-500' />
              Test Drive Booked Successfully
            </DialogTitle>
            <DialogDescription>
              Your test drive has been confirmed with the following details
            </DialogDescription>
          </DialogHeader>

          {/* show the booking details  here */}

          {bookingDetails && (
            <div className='py-4'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Car:</span>
                  <span>
                    {car?.year} {car?.make} {car?.model}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Date:</span>
                  <span>{bookingDetails?.date}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Time Slot:</span>
                  <span>{bookingDetails?.timeSlot}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-medium'>Dealership:</span>
                  <span>{dealership?.name || 'Vehiql Motors'}</span>
                </div>
              </div>

              <div className='mt-4 bg-blue-50 p-3 rounded text-sm text-blue-700'>
                Please arrive 10 minutes early with your driver's license.
              </div>
            </div>
          )}

          <div className='flex justify-end cursor-pointer'>
            <Button onClick={handleCloseConfirmation}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDriveForm;
