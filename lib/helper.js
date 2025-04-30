// Helper function to serialize car data
//we are taking the car data and wishlisted data
//we destructure the car data
//extract the price,createdAt,whishlisted,updatedAt and serialise the data how we needed
export const serializeCarData = (car, wishlisted = false) => {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    wishlisted: wishlisted,
  };
};

//accept the amount and format this in the us doller
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
