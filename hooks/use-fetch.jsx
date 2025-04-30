//custome hook
//this is used for api call and store data,error,loading in diff state

import { toast } from 'sonner';

const { useState } = require('react');

const useFetch = (callback) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  //if we want to provide extra arguement to the funtion we can give like this  "...args"
  const fn = async (...args) => {
    //before fetching the api
    setLoading(true);
    setError(null);

    try {
      const response = await callback(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, setData, fn };
};

export default useFetch;
