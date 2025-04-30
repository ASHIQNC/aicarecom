import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Check, X } from 'lucide-react';
import React from 'react';

const CarFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilters,
}) => {
  // take all the current filter
  const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;
  // we can create an array where we can  display all of the makes
  //we can also show which make is selected

  const filterSections = [
    {
      id: 'make',
      title: 'Make',
      //in make section we need to take all the filters and show all of the option of make
      //we are maping and taking each and every object and seting the value and label
      options: filters.makes.map((make) => ({ value: make, label: make })),

      //if it is selected we will add the curent vallue
      currentValue: make,

      //whem we click on a perticular section we will trigger the functions
      onChange: (value) => onFilterChange('make', value),
    },

    {
      id: 'bodyType',
      title: 'Body Type',
      options: filters.bodyTypes.map((type) => ({ value: type, label: type })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange('bodyType', value),
    },
    {
      id: 'fuelType',
      title: 'Fuel Type',
      options: filters.fuelTypes.map((type) => ({ value: type, label: type })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange('fuelType', value),
    },
    {
      id: 'transmission',
      title: 'Transmission',
      options: filters.transmissions.map((type) => ({
        value: type,
        label: type,
      })),
      currentValue: transmission,
      onChange: (value) => onFilterChange('transmission', value),
    },
  ];
  return (
    <div className='space-y-4'>
      {/* price range */}
      {/* not sure logic will apply */}
      <div className='space-y-4'>
        <h3 className='font-medium'>Price Range</h3>
        <div className='px-2'>
          <Slider
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            //this have 100 steps
            step={100}
            value={priceRange}
            onValueChange={(value) => onFilterChange('priceRange', value)}
          />
        </div>

        <div className='flex items-center justify-between'>
          {/* price range will comes as an array with min and max value */}
          <div className='font-medium text-sm'>$ {priceRange[0]}</div>
          <div className='font-medium text-sm'>$ {priceRange[1]}</div>
        </div>
      </div>

      {/* Filter Categories */}
      {filterSections?.map((section) => (
        <div key={section.id} className='space-y-3'>
          <h4 className='text-sm font-medium flex justify-between'>
            <span>{section.title}</span>
            {/* if any filter is sected we need to show the  clearFilter */}
            {section.currentValue && (
              <button
                className='text-xs text-gray-600 flex items-center'
                onClick={() => onClearFilters(section.id)}
              >
                <X className='mr-1 h-3 w-3' />
                Clear
              </button>
            )}
          </h4>
          {/* show the availble option for the filter */}
          <div className='flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
            {section?.options?.map((option) => (
              <Badge
                key={option.value}
                variant={
                  section?.currentValue === option?.value
                    ? 'default'
                    : 'outline'
                }
                className={`cursor-pointer px-3 py-1 ${
                  section.currentValue === option.value
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  section.onChange(
                    section.currentValue === option.value ? '' : option.value
                  );
                }}
              >
                {option.label}
                {section.currentValue === option.value && (
                  <Check className='ml-1 h-3 w-3 inline' />
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CarFilterControls;
