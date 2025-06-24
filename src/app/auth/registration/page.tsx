"use client";
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoChevronBackSharp } from 'react-icons/io5';
import '@/app/globals.css';

import { registration } from '@/services/auth/registration';

import { ModerSpinner } from '@/components/LoadingSpinner';
import DateOfBirthStep from '@/components/authComponent/steps/DateOfBirthStep';
import GenderStep from '@/components/authComponent/steps/GenderStep';
import PasswordStep from '@/components/authComponent/steps/PasswordStep';
import UsernameStep from '@/components/authComponent/steps/UsernameStep';
import Button from '@/components/shared/Button';
import useLocalStorage from '@/hooks/useLocalStorage';

const ProfileSetting: React.FC = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [dateOfBirth, setDateOfBirth] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('male');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [storedOtpId, setStoredOtpId] = useLocalStorage<string>('otpId', '');
    const [storedMailOrPhone, setStoredMailOrPhone] = useLocalStorage<string>('mailOrPhone', '');
    const [GoogleEmail] = useLocalStorage<string>('googleEmail', '');
    const [GoogleId] = useLocalStorage<string>('googleId', '');
    const [storedToken, setStoredToken] = useLocalStorage<string>('token', '');
    const [storeGoogleEmail, setStoreGoogleEmail] = useLocalStorage<string>('googleEmail', '');
    const [storeGoogleId, setStoreGoogleId] = useLocalStorage<string>('googleId', '');


    const steps = useMemo(() => [
        { component: <UsernameStep username={username} setUsername={setUsername} />, validate: () => username !== '' },
        { component: <DateOfBirthStep dateOfBirth={dateOfBirth} setDateOfBirth={setDateOfBirth} />, validate: () => dateOfBirth !== '' },
        { component: <GenderStep gender={gender} setGender={setGender} />, validate: () => gender !== 'prefer-not-to-say' },
        { component: <PasswordStep password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />, validate: () => password !== '' && password === confirmPassword },
    ], [username, dateOfBirth, gender, password, confirmPassword]);

    const handleNext = useCallback(() => {
        if (!steps[currentStep].validate()) {
            setError('This field is required');
            return;
        }
        setError('');
        setIsLoading(true);
        setTimeout(() => {
            setCurrentStep((prevStep) => prevStep + 1);
            setIsLoading(false);
        }, 900);
    }, [currentStep, steps]);

    const handlePrevious = useCallback(() => {
        setError('');
        setCurrentStep((prevStep) => prevStep - 1);
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const handleFinish = useCallback(async () => {
        if (password === '' || confirmPassword === '') {
            setError('This field is required');
            return;
        }
        if (password !== confirmPassword) {
            return;
        }
        const birthdate = formatDate(dateOfBirth);
        const otpId = parseInt(storedOtpId || '0');
        const mailOrPhone = storedMailOrPhone || '';
        setIsFinished(true);
        try {
            // Check if this is Google signup or regular signup
            const isGoogleSignup = storeGoogleEmail && storeGoogleId;
            
            const registrationData = {
                username: isGoogleSignup ? GoogleEmail : mailOrPhone,
                password: password,
                gender: gender,
                birthdate: birthdate,
                otpId: isGoogleSignup ? null : otpId,
                device_id: 'web',
                fcm_token: 'dhjsaghjfgswjfgshjfgjs123',
                userprofilename: username,
                registration_type: isGoogleSignup ? 1 : 0, // 2 for Google, 0 for regular
                third_party_password: isGoogleSignup ? GoogleId : undefined
            };
            
           
            const response = await registration(registrationData);
            
            if (response.isSuccess) {
                setIsFinished(false);
                setStoredOtpId('');
                setStoredMailOrPhone('');
                // Clear Google localStorage after successful registration
                localStorage.removeItem('googleEmail');
                localStorage.removeItem('googleId');
                setStoredToken(response.data.token);
                toast.success(response.message);
                router.push('/auth/login');
            } else {
                setIsFinished(false);
                toast.error(response.message);
            }
        } catch (error: any) {
            setIsFinished(false);
            console.error('Registration failed:', error);
            if (error.message.includes('404')) {
                toast.error('No Internet Connection');
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    }, [password, confirmPassword, dateOfBirth, gender, username, router, formatDate, storedOtpId, storedMailOrPhone, storeGoogleEmail, storeGoogleId, setStoredOtpId, setStoredMailOrPhone, setStoreGoogleEmail, setStoreGoogleId, setStoredToken]);

    return (

        <div className="w-1/2 h-full max-md:w-full flex flex-col items-center justify-center max-md:justify-start max-md:pt-10 max-md:px-6">
            <div className="glass-card p-8">
                {currentStep > 0 && (
                    <button
                        className="bg-transparent text-text-color font-bold relative top-[-10px] left-[-10px] text-2xl"
                        onClick={handlePrevious}
                    >
                        <IoChevronBackSharp />
                    </button>
                )}
                {steps[currentStep].component}
                {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
                <div className="flex justify-end mt-4">
                    {currentStep < steps.length - 1 && (
                        <Button isLinearBtn={true} onCLick={handleNext}
                            disabled={isLoading}
                        >
                            {isLoading ? <ModerSpinner /> : 'Next'}
                        </Button>

                    )}
                    {currentStep === steps.length - 1 && (
                        <Button isLinearBtn={true} onCLick={handleFinish}
                            disabled={isLoading}
                        >
                            {isLoading ? <ModerSpinner /> : 'Finish'}
                        </Button>

                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSetting;
