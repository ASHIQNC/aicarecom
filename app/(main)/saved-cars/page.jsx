import { getSavedCars } from '@/actions/car-listing';
import SavedCarList from './_components/saved-car-list';
import { auth } from '@clerk/nextjs/server';

export const metadata = {
  title: 'Saved Cars | Vehiql',
  description: 'View your saved cars and favorites',
};

export default async function SavedCarsPage() {
  // Check authentication on server
  //check whether the user is loged in or not
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect=/saved-cars');
  }

  //fetch saved cars

  //  fetch saved cars on the server
  const savedCarResult = await getSavedCars();
  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-6xl mb-6 gradient-title'>Your Saved Cars</h1>
      <SavedCarList initialData={savedCarResult} />
    </div>
  );
}
