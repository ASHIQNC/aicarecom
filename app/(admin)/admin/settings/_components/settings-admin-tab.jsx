import { getUsers, updateUserRole } from '@/actions/settings';
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useFetch from '@/hooks/use-fetch';
import {
  CheckCircle,
  Loader2,
  Search,
  Shield,
  Users,
  UserX,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SettingAdminTab = ({
  saveResult,

  usersData,
  fetchingUsers,
  fetchUsers,
  //   updatingRole,
  //   updateRole,
  //   updateRoleResult,
  //   updateRoleError,
}) => {
  //for searching the user we have a state
  const [userSearch, setUserSearch] = useState('');
  //make admin dlogue box
  const [confirmAdminDialog, setConfirmAdminDialog] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  //remove dlgue box
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null);

  //   useEffect(() => {
  //     fetchUsers();
  //   }, []);
  //   const {
  //     loading: fetchingUsers,
  //     fn: fetchUsers,
  //     data: usersData,
  //     error: usersError,
  //   } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  // Handle errors
  useEffect(() => {
    if (updateRoleError) {
      toast.error(`Failed to update user role: ${updateRoleError.message}`);
    }
  }, [updateRoleError]);

  // Handle successful operations
  useEffect(() => {
    if (updateRoleResult?.success) {
      toast.success('User role updated successfully');
      fetchUsers();
      setConfirmAdminDialog(false);
      setConfirmRemoveDialog(false);
    }
  }, [updateRoleResult]);
  // Make user admin
  const handleMakeAdmin = async () => {
    if (!userToPromote) return;
    await updateRole(userToPromote.id, 'ADMIN');
  };

  // Remove admin privileges
  const handleRemoveAdmin = async () => {
    if (!userToDemote) return;
    await updateRole(userToDemote.id, 'USER');
  };

  //   while search we need to filter our user data
  //we can search the user with respect to name and email
  const filteredUserData = usersData?.success
    ? usersData.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Manage users with admin privileges</CardDescription>
        </CardHeader>
        <CardContent>
          {/* searching the user */}

          <div className='mb-6 relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
            <Input
              type='search'
              placeholder='search users...'
              className='pl-9 w-full'
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {fetchingUsers ? (
            <div className='py-12 flex justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          ) : //   check whether the userData is success and if there is anything inside the filtered data

          usersData?.success && filteredUserData.length > 0 ? (
            <div>
              <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserData.map((userdata) => {
                    return (
                      <TableRow key={userdata.id}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                              {userdata.imageUrl ? (
                                <img
                                  src={userdata.imageUrl}
                                  alt={userdata.name || 'User'}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <Users className='h-4 w-4 text-gray-500' />
                              )}
                            </div>
                            <span>{userdata.name || 'Unnamed User'}</span>
                          </div>
                        </TableCell>

                        {/* email */}
                        <TableCell>{userdata.email}</TableCell>
                        {/* <TableCell>
                          <Badge
                            className={
                              userdata.role === 'ADMIN'
                                ? 'bg-green-800'
                                : 'bg-gray-800'
                            }
                          >
                            {userdata.role}
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          <Badge
                            className={
                              userdata.role === 'ADMIN'
                                ? 'bg-green-800'
                                : 'bg-gray-800'
                            }
                          >
                            {userdata.role}
                          </Badge>
                        </TableCell>

                        {/* here we will have the ability to make the user admin or not */}
                        <TableCell className='text-right'>
                          {userdata.role === 'ADMIN' ? (
                            <Button
                              variant='outline'
                              size='sm'
                              className='text-red-600'
                              onClick={() => {
                                setUserToDemote(userdata);
                                setConfirmRemoveDialog(true);
                              }}
                              disabled={updatingRole}
                            >
                              <UserX className='h-4 w-4 mr-2' />
                              Remove Admin
                            </Button>
                          ) : (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setUserToPromote(userdata);
                                setConfirmAdminDialog(true);
                              }}
                              disabled={updatingRole}
                            >
                              <Shield className='h-4 w-4 mr-2' />
                              Make Admin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='py-12 text-center'>
              <Users className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                No users found
              </h3>
              <p className='text-gray-500'>
                {userSearch
                  ? 'No users match your search criteria'
                  : 'There are no users registered yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Make Admin Dialog */}
      <Dialog open={confirmAdminDialog} onOpenChange={setConfirmAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Admin Privileges</DialogTitle>
            <DialogDescription>
              Are you sure you want to give admin privileges to{' '}
              {userToPromote?.name || userToPromote?.email}? Admin users can
              manage all aspects of the dealership.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmAdminDialog(false)}
              disabled={updatingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleMakeAdmin} disabled={updatingRole}>
              {updatingRole ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Admin Dialog */}
      <Dialog open={confirmRemoveDialog} onOpenChange={setConfirmRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin Privileges</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin privileges from{' '}
              {userToDemote?.name || userToDemote?.email}? They will no longer
              be able to access the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmRemoveDialog(false)}
              disabled={updatingRole}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleRemoveAdmin}
              disabled={updatingRole}
            >
              {updatingRole ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Removing...
                </>
              ) : (
                'Remove Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingAdminTab;
