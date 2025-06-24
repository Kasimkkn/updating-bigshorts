"use client";
import '@/app/globals.css';
import logo from '@/assets/logo.svg';
import { LoadingSpinner, ModerSpinner } from '@/components/LoadingSpinner';
import OtpInput from '@/components/authComponent/OtpInput';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import SafeImage from '@/components/shared/SafeImage';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getFirebaseServices } from '@/lib/firebase';
import { otpverify } from '@/services/auth/otpverify';
import { signup, SignupRequest } from '@/services/auth/signup';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheck } from 'react-icons/fa';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface FormData {
    phone: string;
    email: string;
    country_code?: string;
}

interface Errors {
    phone?: string;
    email?: string;
}

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        phone: '',
        email: '',
    });

    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [typingPhone, setTypingPhone] = useState<boolean>(false);
    const [typingEmail, setTypingEmail] = useState<boolean>(false);
    const [validPhone, setValidPhone] = useState<boolean>(false);
    const [validEmail, setValidEmail] = useState<boolean>(false);
    const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
    const [otpValue, setOtpValue] = useState<number>(0);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
    const phoneRegex = useMemo(() => /^\+91\d{10}$/, []);
    const [storedMailOrPhone, setStoredMailOrPhone] = useLocalStorage<string>('mailOrPhone', '');
    const [storedOtpId, setStoredOtpId] = useLocalStorage<string>('otpId', '');
    const [storeGoogleEmail, setStoreGoogleEmail] = useLocalStorage<string>('googleEmail', '');
    const [storeGoogleId, setStoreGoogleId] = useLocalStorage<string>('googleId', '');
    const [googleLoading, setGoogleLoading] = useState<boolean>(false);
    const [isClient, setIsClient] = useState(false);
    const [showSafariHelp, setShowSafariHelp] = useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);
    const handleGoogleSignUp = async () => {
        if (!isClient) {
            toast.error('Please wait for the page to load completely');
            return;
        }

        try {
            setGoogleLoading(true);

            const { auth, googleProvider } = getFirebaseServices();

            if (!auth || !googleProvider) {
                toast.error('Authentication service not available. Please refresh the page.');
                return;
            }
            // Clear any existing auth state
            if (auth.currentUser) {
                await auth.signOut();
            }

            // Test if popup will be blocked BEFORE calling Firebase
            const testPopup = window.open('', '', 'width=1,height=1,left=9999,top=9999');

            if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
                // Popup is blocked
                testPopup?.close();
                // Show instructions for all browsers
                setShowSafariHelp(true);
                setGoogleLoading(false);
                return;
            }

            // Close test popup immediately
            testPopup.close();

            // Create fresh provider to ensure account selection
            const freshGoogleProvider = new GoogleAuthProvider();
            freshGoogleProvider.setCustomParameters({
                prompt: 'select_account consent',
                access_type: 'offline'
            });

            // Add scopes
            freshGoogleProvider.addScope('email');
            freshGoogleProvider.addScope('profile');
            const result = await signInWithPopup(auth, freshGoogleProvider);
            const user = result.user;

            // Store Google user data
            if (user.email) {
                setStoreGoogleEmail(user.email);
            }
            if (user.providerData[0]?.uid) {
                setStoreGoogleId(user.providerData[0].uid);
            }

            // Call your signup API with Google user data first
            await handleGoogleSignupAPI(user);

            // Then navigate to registration page
            router.push('/auth/registration');

        } catch (error: any) {
            console.error('Google sign-up error:', error);

            // Handle popup blocked error
            if (error.code === 'auth/popup-blocked') {
                setShowSafariHelp(true);
                setGoogleLoading(false);
                return;
            }
            // Show other errors normally
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    toast.error('Sign-up cancelled');
                    break;
                case 'auth/cancelled-popup-request':
                    toast.error('Another sign-up popup is already open');
                    break;
                case 'auth/account-exists-with-different-credential':
                    toast.error('Account already exists with different credentials');
                    break;
                case 'auth/network-request-failed':
                    toast.error('Network error. Please check your connection.');
                    break;
                case 'auth/too-many-requests':
                    toast.error('Too many attempts. Please try again later.');
                    break;
                case 'auth/unauthorized-domain':
                    toast.error('This domain is not authorized for Google sign-up.');
                    break;
                case 'auth/operation-not-allowed':
                    toast.error('Google sign-up is not enabled. Please contact support.');
                    break;
                case 'auth/invalid-api-key':
                    toast.error('Invalid API configuration. Please contact support.');
                    break;
                default:
                    toast.error(`Sign-up failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setGoogleLoading(false);
        }
    };
    const handleGoogleSignupAPI = async (user: User) => {
        try {
            if (!user.email) {
                toast.error('No email found in Google account');
                return;
            }

        } catch (error: any) {
            console.error('Error processing Google user data:', error);
        }
    };

    const validate = (): boolean => {
        let valid = true;
        let errors: Errors = {};

        if (!formData.phone && !formData.email) {
            errors.phone = 'Phone or Email is required';
            errors.email = 'Phone or Email is required';
            valid = false;
        } else {
            if (formData.phone && !phoneRegex.test(formData.phone)) {
                errors.phone = 'Enter a valid phone number';
                valid = false;
            }
            if (formData.email && !emailRegex.test(formData.email)) {
                errors.email = 'Enter a valid email';
                valid = false;
            }
        }

        setErrors(errors);
        return valid;
    };

    const handlePhoneChange = (value: string | undefined) => {
        setFormData({
            ...formData,
            phone: value || '',
        });

        setTypingPhone(true);
        setValidPhone(false);
        setErrors((prevErrors) => ({ ...prevErrors, phone: undefined }));
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'email') {
            setTypingEmail(true);
            setValidEmail(false);
            setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
        }
    };

    const handlePhoneSignup = async (signupData: SignupRequest, setOtpValue: React.Dispatch<React.SetStateAction<number>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setShowOtpInput: React.Dispatch<React.SetStateAction<boolean>>) => {
        try {
            const response = await signup(signupData);
            toast.success(response.message);
            setOtpValue(response.data?.otpId);
            setLoading(false);
            setShowOtpInput(true);
        } catch (error) {
            setLoading(false);
            console.error('Signup failed:', error);
            toast.error('Signup failed. Please try again.');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            const signupData: SignupRequest = {
                username: formData.phone ? formData.phone.slice(-10) : formData.email,
                ...(formData.phone && { country_code: formData.phone.slice(0, formData.phone.length - 10) }),
                registration_type: formData.phone ? 1 : 2,
            };

            if (formData.phone) {
                try {
                    const response = await signup(signupData);
                    if (!response?.isSuccess) {
                        toast.error("User already exist!");
                    } else {
                        setOtpValue(response.data?.otpId);
                        setShowOtpInput(true);
                    }
                    setLoading(false);
                } catch (error: any) {
                    setLoading(false);
                    if (error.message.includes('404')) {
                        toast.error('No Internet Connection');
                    } else {
                        console.error('Signup failed:', error);
                    }
                }

                setLoading(false);
            } else {
                try {
                    const response = await signup(signupData);
                    if (!response?.isSuccess) {
                        toast.error("User already exist!");
                    } else {
                        setOtpValue(response.data?.otpId);
                        setShowOtpInput(true);
                    }
                    setLoading(false);
                } catch (error: any) {
                    setLoading(false);
                    if (error.message.includes('404')) {
                        toast.error('No Internet Connection');
                    } else {
                        console.error('Signup failed:', error);
                    }
                }
            }
        }
    };


    const handleOtpSubmit = async (otp: number) => {
        try {
            setOtpLoading(true);
            const response = await otpverify({ username: formData.phone ? formData.phone.replace('+91', '') : formData.email, otpId: otpValue, otp: otp, registration_type: formData.phone ? 1 : 2 });
            if (response.isSuccess) {
                setOtpLoading(false);
                toast.success(response.message);
                const mailOrPhone = formData.phone ? formData.phone.replace('+91', '') : formData.email;
                setStoredMailOrPhone(mailOrPhone);
                setStoredOtpId(otpValue.toString());
                router.push('/auth/registration');
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
                    toast.error('No Internet Connection');
                }
            } else {
                console.error('An unknown error occurred');

            }
        }
    };

    useEffect(() => {
        if (formData.phone) {
            const timeoutId = setTimeout(() => {
                setTypingPhone(false);
                if (phoneRegex.test(formData.phone)) {
                    setValidPhone(true);
                    setErrors((prevErrors) => ({ ...prevErrors, phone: undefined }));
                } else {
                    setValidPhone(false);
                    setErrors((prevErrors) => ({ ...prevErrors, phone: 'Enter a valid phone number' }));
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setValidPhone(false);
            setTypingPhone(false);
        }
    }, [formData.phone, phoneRegex]);

    useEffect(() => {
        if (formData.email) {
            const timeoutId = setTimeout(() => {
                setTypingEmail(false);
                if (emailRegex.test(formData.email)) {
                    setValidEmail(true);
                    setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
                } else {
                    setValidEmail(false);
                    setErrors((prevErrors) => ({ ...prevErrors, email: 'Enter a valid email' }));
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setValidEmail(false);
            setTypingEmail(false);
        }
    }, [formData.email, emailRegex]);

    return (

        <div className='w-1/2 h-full max-md:w-full flex flex-col items-center justify-center p-6  max-md:justify-start max-md:pt-10 max-md:px-6'>
            {!showOtpInput ? (
                <>
                    <img src={logo.src} alt="logo" className="mb-8 max-md:mb-3" onContextMenu={(e) => e.preventDefault()} />

                    <div className="w-full max-w-sm">
                        <h2 className="text-3xl font-bold text-center mb-4 text-white">Sign Up</h2>
                        <p className="text-center text-white mb-8 ">
                            Welcome! Please enter your phone number or email to create a new account.
                        </p>

                        <form className='glass-card' onSubmit={handleSubmit}>
                            <div className="mb-2 relative">
                                <PhoneInput
                                    international
                                    defaultCountry="IN"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    autoComplete='Off'
                                    placeholder="Enter Phone Number"
                                    className={`linearInput w-full px-4 py-3 text-white rounded-md focus:outline-none ${errors.phone ? 'border-red-500' : 'focus:border-border-color bg-transparent'
                                        }`}
                                    aria-label="Phone Number"
                                />
                                {(typingPhone && !validPhone) && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color">
                                        <LoadingSpinner />
                                    </div>
                                )}
                                {!typingPhone && validPhone && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                        <FaCheck />
                                    </div>
                                )}
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <span className="block text-center mb-2 text-white">Or</span>
                            <div className="mb-4 relative">
                                <Input
                                    type="text"
                                    name="email"
                                    autoComplete='Off'
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    onChange={handleEmailChange}
                                    className={`${errors.email ? 'border-red-500 text-white' : 'focus:border-border-color text-white'
                                        }`}
                                    aria-label="Email"
                                />
                                {(typingEmail && !validEmail) && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color">
                                        <LoadingSpinner />
                                    </div>
                                )}
                                {!typingEmail && validEmail && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                        <FaCheck />
                                    </div>
                                )}
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <Button
                                type="submit"
                                isLinearBtn={true}
                                disabled={loading}
                                aria-label="Send OTP"
                                className='w-full'
                            >
                                {loading ? <ModerSpinner /> : 'Get OTP'}
                            </Button>

                            <div className="text-center mt-4">
                                <div>
                                    <p className="text-white text-center text-sm">OR Sign Up With</p>
                                </div>
                                <div className="flex justify-center space-x-4 mt-2">
                                    <button
                                        onClick={handleGoogleSignUp}
                                        className="flex flex-col items-center justify-center gap-2 hover:bg-primary-bg-color/10 rounded-lg p-4 transition-colors disabled:opacity-50"
                                        aria-label="Sign In with Google"
                                        disabled={loading}
                                    >
                                        <div className="w-8 h-8">
                                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            {/* Add this after the Image component and before the "w-full max-w-sm" div */}
                            {showSafariHelp && (
                                <div className="w-full max-w-sm mb-6 p-4 bg-blue-900/30 border border-blue-400/50 rounded-lg backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-blue-200 font-semibold text-lg">Enable Popups to Continue</h4>
                                        <button
                                            onClick={() => setShowSafariHelp(false)}
                                            className="text-blue-300/70 hover:text-blue-200 text-xl leading-none"
                                            aria-label="Close"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-4 text-blue-100/90 text-sm">
                                        {/* Quick Fix */}
                                        <div className="bg-blue-800/30 p-3 rounded border border-blue-500/30">
                                            <p className="font-medium mb-2 text-blue-200">🚀 Quick Fix:</p>
                                            <p className="text-xs">Look for a popup blocker icon (🚫 or ⚠️) in your address bar and click &quot;Allow&quot;</p>
                                        </div>

                                        {/* Browser-specific instructions */}
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-medium text-blue-200 mb-1">🌐 Chrome / Edge:</p>
                                                <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                                                    <li>Click the popup blocker icon in the address bar</li>
                                                    <li>Select &quot;Always allow popups from this site&quot;</li>
                                                    <li>Click &quot;Done&quot; and try again</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <p className="font-medium text-blue-200 mb-1">🦊 Firefox:</p>
                                                <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                                                    <li>Click &quot;Options&quot; when popup is blocked</li>
                                                    <li>Select &quot;Allow popups for [site]&quot;</li>
                                                    <li>Try signing in again</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <p className="font-medium text-blue-200 mb-1">🧭 Safari:</p>
                                                <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                                                    <li>Safari menu → Preferences → Websites</li>
                                                    <li>Click &quot;Pop-up Windows&quot; in sidebar</li>
                                                    <li>Find this site and change to &quot;Allow&quot;</li>
                                                </ol>
                                            </div>
                                        </div>

                                        {/* Alternative method */}
                                        <div className="border-t border-blue-400/30 pt-3">
                                            <p className="text-xs text-blue-200/80 mb-3">
                                                💡 <strong>Alternative:</strong> You can also right-click the Google sign-in button and select &quot;Open link in new tab&quot;
                                            </p>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setShowSafariHelp(false);
                                                        handleGoogleSignUp();
                                                    }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-primary-text-color py-2 px-3 rounded text-sm font-medium transition-colors"
                                                >
                                                    Try Again
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        // Open Google OAuth in new tab as alternative
                                                        const clientId = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
                                                        const redirectUri = encodeURIComponent(window.location.origin);
                                                        const scope = encodeURIComponent('email profile');
                                                        const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&prompt=select_account`;

                                                        window.open(googleAuthUrl, '_blank');
                                                        setShowSafariHelp(false);
                                                    }}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-primary-text-color py-2 px-3 rounded text-sm font-medium transition-colors"
                                                >
                                                    Open in New Tab
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-center mt-2 text-white text-sm font-normal">
                                Already have an account? <Link href={'/auth/login'} className="text-white underline font-bold">Sign In</Link>
                            </p>
                        </form>

                    </div>
                </>
            ) : (
                <OtpInput
                    value={formData.phone ? formData.phone : formData.email}
                    setOtpInput={setShowOtpInput}
                    onSubmit={handleOtpSubmit}
                    setOtpLoading={setOtpLoading}
                    otpLoading={otpLoading}
                />
            )}
        </div>

    );
};

export default SignUpPage;
