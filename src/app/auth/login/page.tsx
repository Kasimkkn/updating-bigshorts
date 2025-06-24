"use client";
import '@/app/globals.css';
import logo from '@/assets/logo.svg';
import { LoadingSpinner, ModerSpinner } from '@/components/LoadingSpinner';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { login } from '@/services/auth/login';
import EncryptionService from '@/services/encryptionService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheck, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { getFirebaseServices } from '@/lib/firebase';
import { GoogleAuthProvider, User, signInWithPopup } from 'firebase/auth';
import SafeImage from '@/components/shared/SafeImage';


const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<{ phoneOrEmail: string; password: string }>({
    phoneOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ phoneOrEmail?: string; password?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [validInput, setValidInput] = useState<boolean>(false);
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const phoneRegex = useMemo(() => /^(\+\d{1,3}[- ]?)?\d{10}$/, []);
  const [isClient, setIsClient] = useState(false);
  const [showSafariHelp, setShowSafariHelp] = useState(false);

  useEffect(() => {
    if (isClient) {
      // Check Firebase config
    }
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const handleGoogleSignIn = async () => {
    if (!isClient) {
      toast.error('Please wait for the page to load completely');
      return;
    }

    try {
      setLoading(true);

      const { auth, googleProvider } = getFirebaseServices();

      if (!auth || !googleProvider) {
        toast.error('Authentication service not available. Please refresh the page.');
        return;
      }
      // Clear any existing Firebase session
      if (auth.currentUser) {
        await auth.signOut();
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      provider.addScope('email');
      provider.addScope('profile');
      // Test if popup will be blocked BEFORE calling Firebase
      const testPopup = window.open('', '', 'width=1,height=1,left=9999,top=9999');

      if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
        // Popup is blocked
        testPopup?.close();
        // Show instructions for all browsers
        setShowSafariHelp(true);
        setLoading(false);
        return;
      }

      // Close test popup immediately
      testPopup.close();

      // Popup is allowed, proceed with Firebase popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await handleFirebaseLogin(user);

    } catch (error: any) {
      console.error('Google sign-in error:', error);

      // Handle popup blocked error
      if (error.code === 'auth/popup-blocked') {
        setShowSafariHelp(true);
        setLoading(false);
        return;
      }
      // Show other errors normally
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          toast.error('Sign-in cancelled');
          break;
        case 'auth/cancelled-popup-request':
          toast.error('Another sign-in popup is already open');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your connection.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many attempts. Please try again later.');
          break;
        case 'auth/unauthorized-domain':
          toast.error('This domain is not authorized for Google sign-in.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Google sign-in is not enabled. Please contact support.');
          break;
        case 'auth/invalid-api-key':
          toast.error('Invalid API configuration. Please contact support.');
          break;
        default:
          toast.error(`Sign-in failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    let valid = true;
    let errors: { phoneOrEmail?: string; password?: string } = {};

    if (!formData.phoneOrEmail) {
      errors.phoneOrEmail = 'Phone or Email is required';
      valid = false;
    } else if (!emailRegex.test(formData.phoneOrEmail) && !phoneRegex.test(formData.phoneOrEmail)) {
      errors.phoneOrEmail = 'Enter a valid email or phone number';
      valid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      valid = false;
    }
    setErrors(errors);
    return valid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'phoneOrEmail') {
      setTyping(true);
      setValidInput(false);
      setErrors((prevErrors) => ({ ...prevErrors, phoneOrEmail: undefined }));
    }

    if (name === 'password') {
      setErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const loginData = {
          mobileNo: formData.phoneOrEmail,
          isMobile: 0,
          device_id: 'web',
          fcm_token: 'dhjsaghjfgswjfgshjfgjs123',
          password: formData.password,
          login_type: 0
        }
        const response = await login(loginData);


        if (response.isSuccess) {
          // 🔐 Encrypt and store token in localStorage
          const tokenEncrypted = await EncryptionService.encryptRequest(response.data.token);
          // Set encrypted token in cookie
          document.cookie = `token=${encodeURIComponent(JSON.stringify(tokenEncrypted))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure`;
          // 🔐 Encrypt and store other data manually
          const userIdEncrypted = await EncryptionService.encryptRequest(response.data.userId.toString());
          localStorage.setItem("userId", JSON.stringify(userIdEncrypted));
          const usernameEncrypted = await EncryptionService.encryptRequest(response.data.userName.toString());
          localStorage.setItem("username", JSON.stringify(usernameEncrypted));

          const notifyEncrypted = await EncryptionService.encryptRequest(response.data.isallownotification.toString());
          localStorage.setItem("isAllowingNotification", JSON.stringify(notifyEncrypted));

          toast.success('Login successful');
          setFormData({ phoneOrEmail: '', password: '' });
          setTimeout(() => {
            router.push('/home');
          }, 300);
        }

        else {
          toast.error(response.message);
        }
      } catch (error: unknown) {
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
      } finally {
        setLoading(false);
      }
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFirebaseLogin = async (user: User) => {
    try {
      setLoading(true);

      // Check if user email exists
      if (!user.email) {
        toast.error('No email found in Google account');
        return;
      }

      const loginData = {
        mobileNo: user.email, // Now TypeScript knows it's not null
        isMobile: 0,
        device_id: 'web',
        fcm_token: 'dhjsaghjfgswjfgshjfgjs123',
        password: user.providerData[0].uid,
        login_type: 1 // Changed to indicate Google sign-in
      };
      const response = await login(loginData);

      if (response.isSuccess) {
        // 🔐 Encrypt and store token in localStorage
        const tokenEncrypted = await EncryptionService.encryptRequest(response.data.token);
        // Set encrypted token in cookie
        document.cookie = `token=${encodeURIComponent(JSON.stringify(tokenEncrypted))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure`;

        // 🔐 Encrypt and store other data manually
        const userIdEncrypted = await EncryptionService.encryptRequest(response.data.userId.toString());
        localStorage.setItem("userId", JSON.stringify(userIdEncrypted));

        const usernameEncrypted = await EncryptionService.encryptRequest(response.data.userName.toString());
        localStorage.setItem("username", JSON.stringify(usernameEncrypted));

        const notifyEncrypted = await EncryptionService.encryptRequest(response.data.isallownotification.toString());
        localStorage.setItem("isAllowingNotification", JSON.stringify(notifyEncrypted));
        toast.success('Google login successful');

        setTimeout(() => {
          router.push('/home');
        }, 300);
      } else {
        console.error('Firebase login API failed:', response.message);
        toast.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          toast.error('No Internet Connection');
        } else {
          console.error('Firebase login API failed:', error.message);
          toast.error('An unexpected error occurred');
        }
      } else {
        console.error('An unknown error occurred');
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.phoneOrEmail) {
      const timeoutId = setTimeout(() => {
        setTyping(false);
        if (emailRegex.test(formData.phoneOrEmail) || phoneRegex.test(formData.phoneOrEmail)) {
          setValidInput(true);
          setErrors((prevErrors) => ({ ...prevErrors, phoneOrEmail: undefined }));
        } else {
          setValidInput(false);
          setErrors((prevErrors) => ({ ...prevErrors, phoneOrEmail: 'Enter a valid email or phone number' }));
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setValidInput(false);
      setTyping(false);
    }
  }, [formData.phoneOrEmail, emailRegex, phoneRegex]);

  return (

    <div className='w-1/2 h-full max-md:w-full flex flex-col items-center justify-center p-6  max-md:justify-start max-md:pt-10 max-md:px-6'>
      <img src={logo.src} alt="logo" className="mb-8 max-md:mb-3" onContextMenu={(e) => e.preventDefault()} />
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">Sign In</h2>
        <p className="text-center text-white mb-8 ">Welcome! Please enter your credentials to continue your journey</p>
        <div className='glass-card'>
          <div className="mb-4 relative">
            <Input
              type="text"
              name="phoneOrEmail"
              aria-label="Phone or Email"
              autoComplete='Off'
              placeholder="Enter Phone Or Email"
              value={formData.phoneOrEmail}
              onChange={handleChange}
              className={` text-white ${errors.phoneOrEmail ? 'border-red-500' : ' focus:border-border-color'
                } bg-transparent`}
            />
            {typing && !validInput && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color">
                <LoadingSpinner />
              </div>
            )}
            {!typing && validInput && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                <FaCheck />
              </div>
            )}
            {errors.phoneOrEmail && <p className="text-red-500 text-sm mt-1">{errors.phoneOrEmail}</p>}
          </div>
          <div className="mb-4 relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              aria-label="Password"
              placeholder="Password"
              autoComplete='Off'
              value={formData.password}
              onChange={handleChange}
              className={`text-white ${errors.password ? 'border-red-500' : ''
                }focus:border-border-color bg-transparent`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide Password" : "Show Password"}
              className={`absolute top-0 ${errors.password ? 'bottom-6' : 'bottom-0'} right-0 pr-3 flex items-center text-text-color`}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaRegEyeSlash className='text-white' /> : <FaRegEye className='text-white' />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className='mb-4 flex items-center justify-end'>
            <Link href={'/auth/forgot-password'} className='text-sm text-blue-400'>Forgot Password?</Link>
          </div>
          <Button
            onClick={handleSubmit}
            aria-label="Sign in"
            isLinearBtn={true}
            className='w-full'
            disabled={loading}
          >
            {loading ? <ModerSpinner /> : 'Sign In'}
          </Button>
          <div className="text-center mt-4">
            <div>
              <p className="text-white text-center text-sm">OR Sign In With</p>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <button
                onClick={handleGoogleSignIn}
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
          <p className="text-center mt-2 text-white text-sm font-normal">
            Don&#39;t have an account? <Link href={'/auth/sign-up'} className="text-white underline font-bold">Sign Up</Link>
          </p>
        </div>
      </div>
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
                    handleGoogleSignIn();
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
      <div className="mt-6 text-sm text-center text-white space-x-4">
        <Link href="/Policy/privacyPolicy" className="underline hover:text-blue-500">Privacy Policy</Link>
        <span>|</span>
        <Link href="/Policy/childSafety" className="underline hover:text-blue-500">Child Safety</Link>
      </div>

    </div>

  );
};

export default LoginPage;

