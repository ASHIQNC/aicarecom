import React from 'react';
import AddCarForm from './_component/add-car-form';

// we can add metadata
//metadata means nammale cars page link pokumpo browsertable aa name verum
export const metadata = {
  title: 'Add New Car | Vehiql Admin',
  description: 'Add New Car to the marketplace',
};
const AddCarPage = () => {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Add New Car</h1>
      {/* Add car form */}
      <AddCarForm />

      {/* table tp display the data */}
    </div>
  );
};

export default AddCarPage;
