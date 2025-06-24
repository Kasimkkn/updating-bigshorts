"use client";
import { sendforgotpasswordotp } from '@/services/auth/sendforgotpasswordotp';
import { verifyforgotpasswordotp } from '@/services/auth/verifyforgotpasswordotp';
import '@/app/globals.css';
import logo from '@/assets/logo.svg';
import { LoadingSpinner, ModerSpinner } from '@/components/LoadingSpinner';
import OtpInput from '@/components/authComponent/OtpInput';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '@/components/shared/SafeImage';


const ForgotPassword = () => {
    const [formData, setFormData] = useState({ phoneNumber: '', email: '' });
    const [errors, setErrors] = useState({ phoneNumber: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState<{ phoneNumber: boolean; email: boolean }>({ phoneNumber: false, email: false });
    const [validInput, setValidInput] = useState<{ phoneNumber: boolean; email: boolean }>({ phoneNumber: false, email: false });
    const router = useRouter();
    const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
    const phoneRegex = useMemo(() => /^\+91\d{10}$/, []);
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [optValue, setOptValue] = useState<string>();
    const [storedOtpId, setStoredOtpId] = useLocalStorage<string>('otpId', '');
const [storedUserId, setStoredUserId] = useLocalStorage<string>('userId', '');
const [storedUsername, setStoredUsername] = useLocalStorage<string>('username', '');
    const [otpId, setOtpId] = useState<number>();
    const [userId, setUserId] = useState<number>();

    const validatePhoneInput = useCallback((value: string): boolean => {
        let valid = true;
        if (value && !phoneRegex.test(value)) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Enter a valid phone number' }));
            valid = false;
        } else {
            setErrors(prev => ({ ...prev, phoneNumber: '' }));
            setValidInput(prev => ({ ...prev, phoneNumber: value ? true : false }));
        }
        return valid;
    }, [phoneRegex]);
    
    const validateEmailInput = useCallback((value: string): boolean => {
        let valid = true;
        if (value && !emailRegex.test(value)) {
            setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
            valid = false;
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
            setValidInput(prev => ({ ...prev, email: value ? true : false }));
        }
        return valid;
    }, [emailRegex]);

    const validateForm = (): boolean => {
        const { phoneNumber, email } = formData;
        
        if (!phoneNumber && !email) {
            toast.error('Please enter either phone number or email address');
            return false;
        }

        if (phoneNumber && email) {
            toast.error('Please enter either phone number or email address, not both');
            return false;
        }

        if (phoneNumber && !phoneRegex.test(phoneNumber)) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Enter a valid phone number' }));
            return false;
        }

        if (email && !emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
            return false;
        }

        return true;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setValidInput(prev => ({ ...prev, [name]: false }));
        
        // Clear the other field when user starts typing in one
        if (name === 'email' && value) {
            setFormData(prev => ({ ...prev, phoneNumber: '' }));
            setValidInput(prev => ({ ...prev, phoneNumber: false }));
            setErrors(prev => ({ ...prev, phoneNumber: '' }));
        }
    };

    const handlePhoneChange = (value: string | undefined) => {
        setFormData({
            ...formData,
            phoneNumber: value || '',
        });
        setValidInput(prev => ({ ...prev, phoneNumber: false }));

        // Clear email field when user starts typing phone number
        if (value) {
            setFormData(prev => ({ ...prev, email: '' }));
            setValidInput(prev => ({ ...prev, email: false }));
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setLoading(true);
                // Use phone number without +91 if it's a phone number, otherwise use email
                const username = formData.phoneNumber 
                    ? formData.phoneNumber.replace('+91', '') 
                    : formData.email;
                    
                const response = await sendforgotpasswordotp({
                    username: username
                })
                if (response.isSuccess) {
                    setOtpId(response.data?.otpId);
                    setStoredOtpId(response.data?.otpId.toString());
                    setUserId(response.data?.userId);
                    setStoredUserId(response.data?.userId.toString());
                    setOptValue(response.data?.username);
                    setStoredUsername(response.data?.username);
                    setIsOtpOpen(true);
                } else {
                    toast.error(response.message);
                }
                setLoading(false);
            } catch (error: unknown) {
                setLoading(false);
                if (error instanceof Error) {
                    if (error.message.includes('404')) {
                        toast.error('No Internet Connection');
                    } else {
                        console.error('Login failed:', error.message);
                        toast.error('An unexpected error occurred');
                    }
                } else {
                    console.error('An unknown error occurred');
                    toast.error('An unexpected error occurred');
                }
            }
        }
    };

    const handleOtpSubmit = async (otp: number) => {
        try {
            // Use phone number without +91 if it's a phone number, otherwise use email
            const username = formData.phoneNumber 
                ? formData.phoneNumber.replace('+91', '') 
                : formData.email;
                
            const response = await verifyforgotpasswordotp({ username: username, otpId: otpId, otp: otp, userId: userId });
            if (response.isSuccess) {
                setOtpLoading(false);
                router.push('/auth/change-password');
            } else {
                toast.error(response.message);
                setOtpLoading(false);
            }
        } catch (error: unknown) {
            setOtpLoading(false);
            if (error instanceof Error) {
                if (error.message.includes('404')) {
                    toast.error('No Internet Connection');
                } else {
                    console.error('Login failed:', error.message);
                }
            } else {
                console.error('An unknown error occurred');
            }
        }
    };

    useEffect(() => {
        if (formData.phoneNumber) {
            setTyping(prev => ({ ...prev, phoneNumber: true }));
            const timeout = setTimeout(() => {
                setTyping(prev => ({ ...prev, phoneNumber: false }));
                validatePhoneInput(formData.phoneNumber);
            }, 400);
    
            return () => clearTimeout(timeout);
        } else {
            setTyping(prev => ({ ...prev, phoneNumber: false }));
            setValidInput(prev => ({ ...prev, phoneNumber: false }));
        }
    }, [formData.phoneNumber, validatePhoneInput]);
    
    useEffect(() => {
        if (formData.email) {
            setTyping(prev => ({ ...prev, email: true }));
            const timeout = setTimeout(() => {
                setTyping(prev => ({ ...prev, email: false }));
                validateEmailInput(formData.email);
            }, 400);
    
            return () => clearTimeout(timeout);
        } else {
            setTyping(prev => ({ ...prev, email: false }));
            setValidInput(prev => ({ ...prev, email: false }));
        }
    }, [formData.email, validateEmailInput]);

    return (
        <div className='w-1/2 h-full max-md:w-full flex flex-col items-center justify-center p-6 max-md:justify-start max-md:pt-10 max-md:px-6'>
            <img src={logo.src} alt="logo" className="mb-8 max-md:mb-3" onContextMenu={(e) => e.preventDefault()} />
            {isOtpOpen ? <OtpInput value={optValue} onSubmit={handleOtpSubmit} otpLoading={otpLoading} setOtpLoading={setOtpLoading} setOtpInput={setIsOtpOpen} /> : (
                <div className="w-full max-w-sm">
                    <h2 className="text-3xl font-bold text-center mb-4 text-white">Enter Your Credentials</h2>
                    <p className="text-center text-white mb-8">An OTP will be sent to you!</p>
                    <form className='glass-card' onSubmit={handleSubmit}>
                        {/* Phone Number Field */}
                        <div className="mb-4 relative">
                            <PhoneInput
                                international
                                defaultCountry="IN"
                                value={formData.phoneNumber}
                                onChange={handlePhoneChange}
                                autoComplete='tel'
                                placeholder="Enter Phone Number"
                                className={`linearInput w-full px-4 py-3 text-text-color rounded-md focus:outline-none ${
                                    errors.phoneNumber ? 'border-red-500' : 'focus:border-border-color bg-transparent text-white'
                                }`}
                                aria-label="Phone Number"
                            />
                            {typing.phoneNumber && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color">
                                    <LoadingSpinner />
                                </div>
                            )}
                            {!typing.phoneNumber && validInput.phoneNumber && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                    {/* <FaCheck /> */}
                                </div>
                            )}
                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                        </div>

                        {/* OR Divider */}
                        <div className="mb-4 flex items-center">
                            <div className="flex-1 border-t border-border-color"></div>
                            <span className="px-4 text-white text-sm font-medium">OR</span>
                            <div className="flex-1 border-t border-border-color"></div>
                        </div>

                        {/* Email Field */}
                        <div className="mb-4 relative">
                            <Input
                                type="email"
                                name="email"
                                aria-label="Email"
                                autoComplete='email'
                                placeholder="Enter Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full ${errors.email ? 'border-red-500' : ''} text-white`}
                            />
                            {typing.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color">
                                    <LoadingSpinner />
                                </div>
                            )}
                            {!typing.email && validInput.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                    {/* <FaCheck /> */}
                                </div>
                            )}
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <Button
                            type="submit"
                            aria-label="Submit"
                            className='w-full'
                            isLinearBtn={true}
                            disabled={loading}
                        >
                            {loading ? <ModerSpinner /> : 'Get OTP'}
                        </Button>
                        <p className="text-center mt-2 text-white text-sm font-normal">
                            Don&#39;t have an account? <Link href={'/auth/sign-up'} className="text-white underline font-bold">Sign Up</Link>
                        </p>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ForgotPassword;