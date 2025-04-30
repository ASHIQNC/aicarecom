import { getCarById } from '@/actions/car-details';
import React from 'react';
import CarDetailsPage from './_components/car-details';

//when we share the link with some other regarding the cardetails,
// we need to show the image of the car with so details.we have seen this type of example in some links like amzaon products
//to achieve that we are writing some meta datas

export async function generateMetadata({ params }) {
  const { id } = await params;
  //we will get the car data
  const result = await getCarById(id);
  //if the result is false return car not found

  if (!result.success) {
    return {
      title: 'Car Not Found ',
      description: 'The requested car could not be found',
    };
  }

  //otherwise take the cardata
  const car = result?.data;
  return {
    title: `${car?.year} ${car?.make} ${car?.model} | Vehiql`,
    description: car.description.substring(0, 160),
    //this will enable us to display the image of thecar
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}
const CarPage = async ({ params }) => {
  const { id } = await params;

  //we will get the car data
  const result = await getCarById(id);

  if (!result?.success) {
    notFound(); // Will trigger the default or custom not-found page
  }

  return (
    <div className='container mx-auto px-4 py-12'>
      <CarDetailsPage
        car={result?.data}
        testDriveInfo={result?.data.testDriveInfo}
      />
    </div>
  );
};

export default CarPage;
