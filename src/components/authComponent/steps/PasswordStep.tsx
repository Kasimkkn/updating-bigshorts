import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

interface PasswordStepProps {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordsMatch = () => {
    return password === confirmPassword;
  };

  return (
    <div>
      <h3 className="text-lg text-text-color font-bold">Enter Your Password and Confirm It</h3>
      <h5 className="text-sm text-text-color font-normal mb-2">Don&#39;t worry, you can always change it later!</h5>

      <div className="relative mb-4">
        <input
          type={showPassword ? 'text' : 'password'}
          className="linearInput text-text-color w-full px-4 py-2 border rounded-md focus:outline-none"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaRegEyeSlash className='text-text-color' /> : <FaRegEye className='text-text-color' />}
        </button>
      </div>

      <div className="relative">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          className="linearInput text-text-color w-full px-4 py-2 border rounded-md focus:outline-none"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={toggleConfirmPasswordVisibility}
        >
          {showConfirmPassword ? <FaRegEyeSlash className='text-text-color' /> : <FaRegEye className='text-text-color' />}
        </button>
      </div>

      {!checkPasswordsMatch() && password && confirmPassword && (
        <div className="text-red-500 mt-1 text-sm capitalize">
          Passwords do not match
        </div>
      )}
    </div>
  );
};

export default PasswordStep;
