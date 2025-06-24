import React, { useEffect } from 'react'

interface DateOfBirthStepProps {
  dateOfBirth: string;
  setDateOfBirth: React.Dispatch<React.SetStateAction<string>>;
}

const DateOfBirthStep: React.FC<DateOfBirthStepProps> = ({ dateOfBirth, setDateOfBirth }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateOfBirth(event.target.value);
  };

  // Calculate date limits
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const formattedEighteenYearsAgo = eighteenYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    // Set default date to 18 years ago when component mounts
    if (!dateOfBirth) {
      setDateOfBirth(formattedEighteenYearsAgo);
    }
  }, [dateOfBirth, setDateOfBirth, formattedEighteenYearsAgo]);

  return (
    <div className='flex flex-col gap-1'>
      <h2 className="text-lg font-bold text-text-color">Select your birth date</h2>
      <h6 className="text-sm text-text-color font-normal">Don&#39;t worry ! we will keep it private.</h6>
      <div className="md-mobile-picker-inline my-2 bg-transparent">
        <input
          type="date"
          className="bg-transparent border border-border-color text-text-color p-1"
          onChange={handleDateChange}
          value={dateOfBirth}
          max={formattedEighteenYearsAgo}
          placeholder="Click here"
        />
      </div>
    </div>
  );
};

export default DateOfBirthStep;