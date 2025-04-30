'use client';
import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from '@/actions/settings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFetch from '@/hooks/use-fetch';
import { Clock, Loader2, Save, Shield } from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SettingAdminTab from './settings-admin-tab';

// Day names for display
const DAYS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];
const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: '09:00',
      closeTime: '18:00',
      isOpen: day.value !== 'SUNDAY',
    }))
  );

  //for searching the user we have a state
  const [userSearch, setUserSearch] = useState('');

  //import all4 server action
  // Custom hooks for API calls
  const {
    loading: fetchingSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  //first  we need to get the dealer ship and user info
  useEffect(() => {
    fetchDealershipInfo();
    fetchUsers();
  }, []);

  // Handle errors
  useEffect(() => {
    if (settingsError) {
      toast.error('Failed to load dealership settings');
    }

    if (saveError) {
      toast.error(`Failed to save working hours: ${saveError.message}`);
    }

    if (usersError) {
      toast.error('Failed to load users');
    }
  }, [settingsError, saveError, usersError]);

  //handle working hour change
  // Handle working hours change
  //it accept index,field(open or closed),what value oam providing here
  const handleWorkingHourChange = (index, field, value) => {
    //take the shallow copy of the woriking hours that we created
    const updatedHours = [...workingHours];
    //select the index of which we want update the hour
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    //set the working hour
    setWorkingHours(updatedHours);
  };

  // Save working hours
  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  //create a useEffect to show the toast abd update show the updated dealership info in the table

  useEffect(() => {
    if (saveResult?.success) {
      toast.success('working hours saved saccessfully');
      fetchDealershipInfo();
    }
  }, [saveResult]);

  // Set working hours when settings data is fetched
  useEffect(() => {
    // Check if settingsData exists and was successfully fetched
    if (settingsData?.success && settingsData.data) {
      const dealership = settingsData.data; // Get the dealership info from the response

      // If dealership has any working hours data
      if (dealership.workingHours.length > 0) {
        // Map over the full list of days in the week (DAYS array)
        const mappedHours = DAYS.map((day) => {
          // Try to find a matching entry for the current day from the fetched workingHours
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          // If data is found for this day, return it
          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }

          // If no data exists for this day, return default timings
          return {
            dayOfWeek: day.value,
            openTime: '09:00',
            closeTime: '18:00',
            isOpen: day.value !== 'SUNDAY', // Sunday is closed by default
          };
        });

        // Update local state with the new mapped working hours
        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]); // This effect runs whenever `settingsData` changes

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='hours'>
        <TabsList>
          <TabsTrigger value='hours' className='w-full'>
            <Clock className='h-4 w-4 mr-2' />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value='admins' className='w-full'>
            <Shield className='h-4 w-4 mr-2' />
            Admin Users
          </TabsTrigger>
        </TabsList>
        {/* working hours */}
        <TabsContent value='hours' className='space-y-6 mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your dealership's working hours for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* forrm for updating the working hours */}
              {fetchingSettings ? (
                <div className='flex justify-center items-center py-10'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-500' />
                  <span className='ml-2 text-gray-500'>
                    Loading working hours...
                  </span>
                </div>
              ) : (
                <div className='space-y-4'>
                  {DAYS.map((day, index) => {
                    return (
                      <div
                        key={day.value}
                        className='grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50'
                      >
                        <div className='col-span-3 md:col-span-2'>
                          <div className='font-medium'>{day.label}</div>
                        </div>

                        {/* checkbox */}

                        <div className='col-span-9 md:col-span-2 flex items-center'>
                          <Checkbox
                            id={`is-open-${day.value}`}
                            checked={workingHours[index]?.isOpen}
                            onCheckedChange={(checked) => {
                              handleWorkingHourChange(index, 'isOpen', checked);
                            }}
                          />
                          <Label
                            htmlFor={`is-open-${day.value}`}
                            className='ml-2 cursor-pointer'
                          >
                            {workingHours[index]?.isOpen ? 'Open' : 'Closed'}
                          </Label>
                        </div>

                        {/* each end every day  we need to enter the slot*/}

                        {/* working hours of that perticular index is open render this */}
                        {workingHours[index]?.isOpen && (
                          <>
                            <div className='col-span-5 md:col-span-4'>
                              {/* starting time */}
                              <div className='flex items-center'>
                                <Clock className='h-4 w-4 text-gray-400 mr-2' />
                                <Input
                                  type='time'
                                  value={workingHours[index]?.openTime}
                                  onChange={(e) =>
                                    handleWorkingHourChange(
                                      index,
                                      'openTime',
                                      e.target.value
                                    )
                                  }
                                  className='text-sm'
                                />
                              </div>
                            </div>

                            <div className='text-center col-span-1'>to</div>
                            {/* closing time */}
                            <div className='col-span-5 md:col-span-3'>
                              <Input
                                type='time'
                                value={workingHours[index]?.closeTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    'closeTime',
                                    e.target.value
                                  )
                                }
                                className='text-sm'
                              />
                            </div>
                          </>
                        )}

                        {!workingHours[index]?.isOpen && (
                          <div className='col-span-11 md:col-span-8 text-gray-500 italic text-sm'>
                            Closed all day
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* button to update the working hour */}
              <div className='mt-6 flex justify-end'>
                <Button onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='admins' className='space-y-6 mt-6'>
          <SettingAdminTab
            fetchingUsers={fetchingUsers}
            usersData={usersData}
            saveResult={saveResult}
            fetchUsers={fetchUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
