import React from 'react';
import { IoIosMale } from 'react-icons/io';
import { IoFemaleOutline, IoMaleFemaleOutline } from 'react-icons/io5';
import Button from '@/components/shared/Button';

type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

interface GenderStepProps {
  gender: Gender;
  setGender: React.Dispatch<React.SetStateAction<Gender>>;
}

const GenderStep: React.FC<GenderStepProps> = ({ gender, setGender }) => {
  const handleGenderChange = (gender: Gender) => {
    setGender(gender);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-text-color">Select Your Gender</h2>
      <h6 className="text-sm text-text-color font-normal">Please choose your gender.</h6>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
        <Button
          className='flex-col'
          isLinearBtn={gender === 'male'}
          onClick={() => handleGenderChange('male')}
        >
          <IoIosMale size={48} />
          <span>Male</span>
        </Button>
        <Button
          className='flex-col'
          isLinearBtn={gender === 'female'}
          onClick={() => handleGenderChange('female')}
        >
          <IoFemaleOutline size={48} />
          <span>Female</span>
        </Button>
        <Button
          className='flex-col'
          isLinearBtn={gender === 'other'}
          onClick={() => handleGenderChange('other')}
        >
          <IoMaleFemaleOutline size={48} />
          <span>Other</span>
        </Button>
        <Button
          className='flex-col'
          isLinearBtn={gender === 'prefer-not-to-say'}
          onClick={() => handleGenderChange('prefer-not-to-say')}
        >
          <span>Prefer not to say</span>
        </Button>
      </div>
    </div>
  );
};

export default GenderStep;
