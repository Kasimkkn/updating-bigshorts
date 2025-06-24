"use client";
import { changeKnownPassword } from '@/services/auth/changeknownpassword';
import '@/app/globals.css';
import logo from '@/assets/logo.svg';
import { ModerSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import SafeImage from '@/components/shared/SafeImage';

const ChangeKnownPassword = () => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({ currentPassword: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({ currentPassword: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validInput, setValidInput] = useState({ currentPassword: false, password: false, confirmPassword: false });

    const validateInput = (): boolean => {
        let valid = true;
        let errors = { currentPassword: '', password: '', confirmPassword: '' };

        if (!formData.currentPassword) {
            errors.currentPassword = 'Current password is required';
            valid = false;
        } else {
            setValidInput((prevState) => ({ ...prevState, currentPassword: true }));
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
            valid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            valid = false;
        } else {
            setValidInput((prevState) => ({ ...prevState, password: true }));
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirm Password is required';
            valid = false;
        } else if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = 'Passwords do not match';
            valid = false;
        } else {
            setValidInput((prevState) => ({ ...prevState, confirmPassword: true }));
        }

        setErrors(errors);
        return valid;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setValidInput({ currentPassword: false,password: false, confirmPassword: false });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateInput()) {
            try {
                setLoading(true);
                const response = await changeKnownPassword({
                    
                    current_password: formData.currentPassword,
                    new_password: formData.password,
                    confirm_password: formData.confirmPassword,
                    
                })
                if (response.isSuccess) {
                    toast.success(response.message);
                    localStorage.clear();
                    router.push('/auth/login');
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
                    }
                } else {
                    console.error('An unknown error occurred');
                }
            }
        }
    };

    return (

        <div className='w-1/2 h-full max-md:w-full flex flex-col items-center justify-center p-6 max-md:justify-start max-md:pt-10 max-md:px-6'>
            <img
                src={logo.src} 
                alt="logo" 
                className="mb-8 max-md:mb-3" 
                onContextMenu={(e) => e.preventDefault()} 
            />
            <div className="w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center mb-4 text-text-color ">Change Your Password</h2>
                <p className="text-center text-text-color mb-8 ">Please enter your new password.</p>
                <form className='glass-card' onSubmit={handleSubmit}>
                    <div className="mb-4 relative">
                        <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="currentPassword"
                            aria-label="Current Password"
                            autoComplete='Off'
                            placeholder="Enter Current Password"
                            value={formData.currentPassword || ''}
                            onChange={handleChange}
                            className={`${errors.currentPassword ? 'border-red-500' : ''}`}
                        />
                        <div
                            className={`absolute top-0 ${errors.currentPassword ? 'bottom-6' : 'bottom-0'} right-0 pr-3 flex items-center text-text-color cursor-pointer`}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? <FaRegEyeSlash className="text-text-color" /> : <FaRegEye className="text-text-color" />}
                        </div>

                        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    </div>
                    <div className="mb-4 relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            aria-label="Password"
                            autoComplete='Off'
                            placeholder="Enter New Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${errors.password ? 'border-red-500' : ''
                                }`}
                        />
                        <div
                            className={`absolute top-0 ${errors.password ? 'bottom-6' : 'bottom-0'} right-0 pr-3 flex items-center text-text-color cursor-pointer`}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaRegEyeSlash className="text-text-color" /> : <FaRegEye className="text-text-color" />}
                        </div>

                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="mb-4 relative">
                        <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            aria-label="Confirm Password"
                            autoComplete='Off'
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`${errors.confirmPassword ? 'border-red-500' : ''
                                }`}
                        />
                        <div
                            className={`absolute top-0 ${errors.confirmPassword ? 'bottom-6' : 'bottom-0'} right-0 pr-3 flex items-center text-text-color`}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaRegEyeSlash className="text-text-color" /> : <FaRegEye className="text-text-color" />}
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <Button
                        type="submit"
                        className='w-full'
                        aria-label="Submit"
                        isLinearBtn={true}
                        disabled={loading}
                    >
                        {loading ? <ModerSpinner /> : 'Change Password'}
                    </Button>
                </form>
            </div>
        </div>

    )
}

export default ChangeKnownPassword;
