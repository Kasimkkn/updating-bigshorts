import { editProfile } from '@/services/updateuserprofile';
import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { ModerSpinner } from '../LoadingSpinner';
import { ProfileData } from '@/types/usersTypes';
import Input from '../shared/Input';
import Image from 'next/image';
import { checkusernameexist } from '@/services/auth/checkusernameexist';
import { getusernamesuggestion } from '@/services/auth/getusernamesuggestion';
import { uploadImage } from '@/utils/fileupload';
import { emailValidator, phoneNumberValidator, usernameValidator } from '@/utils/validators';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import toast from 'react-hot-toast';
import 'react-phone-number-input/style.css';
import { sendPhoneUpdateOtp } from '@/services/auth/sendphoneupdateotp';
import OtpInput from '../authComponent/OtpInput';
import { verifyContactChangeOtp } from '@/services/auth/verifycontactchangeotp';
import { sendEmailUpdateOtp } from '@/services/auth/sendemailupdateotp';
import SafeImage from '../shared/SafeImage';

interface FormData {
    profileImage: File | string | null;
    fullName: string;
    userName: string;
    email: string;
    mobileNo: string;
    birthDate: string;
    gender: string;
    profileBio: string;
    websiteLink: string;
    imageUrl?: string;
}
type EditProfileFormProps = {
    closeForm: () => void
    profileData: ProfileData,
    fetchProfile: (userId: number) => void
}

const EditProfileForm = ({ closeForm, profileData, fetchProfile }: EditProfileFormProps) => {
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        profileImage: profileData.userProfileImage || '',
        fullName: profileData.userFullName,
        userName: profileData.userName,
        email: profileData.userEmail,
        mobileNo: profileData.userMobile,
        birthDate: profileData.userBirthdate,
        gender: profileData.userGender,
        profileBio: profileData.userProfileBio,
        websiteLink: profileData.userWebsiteLink,
        imageUrl: profileData.userProfileImage || ''
    });

    const [imagePreview, setImagePreview] = useState<string | null>(profileData.userProfileImage ? profileData.userProfileImage : null);
    const [mobileError, setMobileError] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
    const [userNameValidationLoading, setUserNameValidationLoading] = useState(false);
    const [countryCode, setCountryCode] = useState<string>('91');
    const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(profileData.userMobile ? true : false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(profileData.userEmail ? true : false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState<boolean>(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
    const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
    const [sendingOtpTo, setSendingOtpTo] = useState<string>('');
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [otpId, setOtpId] = useState<number | null>(null);
    const username = formData.userName;

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (username.trim() === '') {
                setUsernameSuggestions([]);
                setUsernameError('');
                setUserNameValidationLoading(false);
                return;
            }

            if (username === profileData.userName) {
                setUsernameError('');
                setUsernameSuggestions([]);
                setUserNameValidationLoading(false);
                return;
            }

            setUserNameValidationLoading(true);
            const timer = setTimeout(async () => {
                const validationError = usernameValidator(username);
                if (validationError) {
                    setUsernameError(validationError);
                    setUsernameSuggestions([]);
                } else {
                    const usernameExist = await checkusernameexist({ userName: username });

                    if (usernameExist.isSuccess) {
                        setUsernameError('');
                        setUsernameSuggestions([]);
                    } else {
                        // Username is not available
                        setUsernameError("Username already taken");
                        const response = await getusernamesuggestion({ userName: username });
                        setUsernameSuggestions(response.data || []);
                    }
                }
                setUserNameValidationLoading(false);
            }, 400);

            return () => clearTimeout(timer);
        };

        fetchSuggestions();
    }, [username]);

    const handleSuggestionClick = (suggestion: string) => {
        setFormData({
            ...formData,
            userName: suggestion,
        });
        setUsernameSuggestions([]);
        setUsernameError('');
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            try {
                await handleFileSelect(file);
            } catch (error) {
                console.error('Error selecting file:', error);
            }
        }
    };


    const handleFileSelect = async (file: File): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                setUploadLoading(true);
                const localFilePath = URL.createObjectURL(file);


                setImagePreview(localFilePath);


                const needsUpload = !localFilePath.startsWith('http') && !localFilePath.startsWith('https');

                let uploadedImageUrl = localFilePath;

                if (needsUpload) {
                    try {

                        const imageFile = await fetch(localFilePath).then(r => r.blob());
                        const uploadFile = new File([imageFile], `profile_image.jpg`, { type: 'image/jpeg' });


                        const uploadResult = await uploadImage(uploadFile, "InteractiveVideos", false);

                        if (!uploadResult) {
                            throw new Error("Image upload failed");
                        }


                        uploadedImageUrl = uploadResult;
                        setImagePreview(uploadedImageUrl);
                    } catch (uploadError) {
                        console.error('Error uploading image:', uploadError);
                        setUploadLoading(false);
                        throw uploadError;
                    }
                }

                const resultsReturns = {
                    imageUrl: uploadedImageUrl,
                    imageFile: file,
                    localPath: localFilePath,
                    isUploaded: needsUpload
                };

                setFormData({
                    ...formData,
                    profileImage: uploadedImageUrl, // Store the uploaded URL
                    imageUrl: uploadedImageUrl
                });

                setUploadLoading(false);
                resolve(resultsReturns);
            } catch (error) {
                setUploadLoading(false);
                reject(new Error("Error processing image file"));
            }
        });
    };


    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setFormData({
            ...formData,
            profileImage: '',
            imageUrl: ''
        });
        setImagePreview(null);


        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePhoneChange = (value: string | undefined) => {
        setIsPhoneVerified(false);
        setMobileError('');
        setFormData({
            ...formData,
            mobileNo: value || '',
        })
    }

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsEmailVerified(false);
        setEmailError('');
        const { value } = e.target;
        setFormData({
            ...formData,
            email: value,
        });
    }

    const handlePhoneVerification = async () => {
        if (!formData.mobileNo) {
            setMobileError('Please enter a mobile number');
            return;
        }

        if (!isValidPhoneNumber(formData.mobileNo)) {
            setMobileError('Please enter a valid phone number');
            return;
        }

        try {
            setIsVerifyingPhone(true);
            setMobileError('');
            const parsedPhone = parsePhoneNumber(formData.mobileNo);
            if (!parsedPhone) {
                setMobileError('Invalid phone number format');
                return;
            }

            const response = await sendPhoneUpdateOtp({
                mobileNo: parsedPhone.nationalNumber,
                country_code: parsedPhone.countryCallingCode,
            })
;
            if (response.isSuccess) {
                setSendingOtpTo(parsedPhone.number);
                setShowOtpInput(true);
                setCountryCode(parsedPhone.countryCallingCode);
                setOtpId(response.data.otpId);
            } else {
                setIsVerifyingPhone(false);
                toast.error(response.message || 'Failed to send OTP');
                setMobileError(response.message || '');
                setIsPhoneVerified(false);
            }
        } catch (error) {
            console.error('Error verifying phone number:', error);
            toast.error('An error occurred while verifying the phone number');
        }finally{
            setIsVerifyingPhone(false);
        }
    }

    const handleEmailVerification = async () => {
        setIsVerifyingEmail(true);
        setEmailError('');
        if (!formData.email) {
            setEmailError('Please enter an email address');
            setIsVerifyingEmail(false);
            return;
        }
        if (emailValidator(formData.email)!==null) {
            setEmailError('Please enter a valid email address');
            setIsVerifyingEmail(false);
            return;
        }
        try {
            const response = await sendEmailUpdateOtp({
                newEmail: formData.email,
            });

            if (response.isSuccess) {
                setSendingOtpTo(formData.email);
                setShowOtpInput(true);
                setIsEmailVerified(false);
                setOtpId(response.data.otpId);
            } else {
                setIsVerifyingEmail(false);
                toast.error(response.message || 'Failed to send OTP');
                setEmailError(response.message || '');
                setIsEmailVerified(false);
            }
        }
        catch (error) {
            console.error('Error sending email verification:', error);
            toast.error('An error occurred while sending the email verification');
        }
        finally {
            setIsVerifyingEmail(false);
        }
    }

    const handleOtpSubmit = async (otp: number) => {
        setOtpLoading(true);
        if(!otpId){
            toast.error('An error occurred while verifying the OTP');
            return;
        }
        try {
            const isForEmail = sendingOtpTo.includes('@');
            let username
            if(isForEmail){
                username = formData.email;
            }else{
                username = parsePhoneNumber(formData.mobileNo)?.nationalNumber || "";
            }
            const res = await verifyContactChangeOtp({
                otpId: otpId,
                otp: otp.toString(),
                username: username,
                country_code: countryCode,
            })
            if (res.isSuccess) {
                if(isForEmail) {
                    setIsEmailVerified(true);
                    setShowOtpInput(false);
                    toast.success('Email verified successfully');
                }else{
                    setIsPhoneVerified(true);
                    setShowOtpInput(false);
                    toast.success('Phone number verified successfully');
                }
            } else {
                toast.error(res.message || 'Failed to verify');
            }
        }catch (error) {
            toast.error('An error occurred while verifying the OTP');
        }finally{
            setOtpLoading(false);
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Validate Email in formData
        if (formData.email && emailValidator(formData.email)) {
            setEmailError('Please enter a valid email')
            return;
        }

        // Phone number in formData
        const nationalNumber = parsePhoneNumber(formData.mobileNo)?.nationalNumber || "";
        const nationalNumberValidationError = phoneNumberValidator(nationalNumber);
        if (formData.mobileNo && nationalNumberValidationError) {
            setMobileError('Please enter a valid number');
            return;
        }

        // If email is changed, check if it is verified
        if(formData.email !== profileData.userEmail && !isEmailVerified) {
            toast.error('Please verify your email before updating your profile');
            return;
        }

        // If phone number is changed, check if it is verified
        if(formData.mobileNo !== profileData.userMobile && !isPhoneVerified) {
            toast.error('Please verify your phone number before updating your profile');
            return;
        }

        try {
            setLoading(true);

            const response = await editProfile({...formData, mobileNo: nationalNumber});
            if (response.isSuccess) {
                closeForm();
                fetchProfile(profileData.userId);
            }
        } catch (error) {
            console.error('Failed to edit profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-2 flex flex-col gap-2 w-full px-36 max-xl:px-20 max-lg:px-14 max-md:px-0 max-md:pb-20">
            <div className="w-full px-4 py-4">
                <h2 className="mb-4 text-xl font-bold text-text-color">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                        <div className="sm:col-span-2 relative">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />

                            {imagePreview ? (
                                <>
                                    <div className="relative">
                                        <SafeImage
                                            src={imagePreview}
                                            alt="Profile Preview"
                                            className="mt-2 h-32 w-32 rounded-full object-cover"
                                        />
                                        {uploadLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-color bg-opacity-50 rounded-full">
                                                <ModerSpinner />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        disabled={uploadLoading}
                                        className="absolute -top-2 left-24 bg-bg-color border border-border-color p-1 rounded-full text-text-color hover:bg-secondary-bg-color disabled:opacity-50"
                                    >
                                        <FiEdit size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={uploadLoading}
                                        className="absolute top-4 left-[7.5rem] bg-bg-color border border-border-color p-1 rounded-full text-text-color hover:bg-secondary-bg-color disabled:opacity-50"
                                    >
                                        <FiTrash size={20} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="w-32 h-32 rounded-full bg-secondary-bg-color flex items-center justify-center">
                                        {uploadLoading ? (
                                            <ModerSpinner />
                                        ) : (
                                            <span className="text-gray-500">No Image</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        disabled={uploadLoading}
                                        className="bg-bg-color border border-border-color px-4 py-2 rounded-lg text-text-color hover:bg-secondary-bg-color disabled:opacity-50"
                                    >
                                        {uploadLoading ? 'Uploading...' : 'Select Profile Image'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <Input
                                label='Full Name'
                                type="text"
                                name="fullName"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="rounded-lg focus:border-primary-600 block w-full p-2.5"
                            />
                        </div>

                        <div className="w-full">
                            <div className="relative">
                                <Input
                                    label='Username'
                                    type="text"
                                    name="userName"
                                    id="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className={`rounded-lg block w-full p-2.5 border-2 ${usernameError ? 'border-red-500' : 'border-border-color'}`}
                                />
                                <div className="absolute right-3 top-1/2">
                                    {userNameValidationLoading && username.trim() !== '' && <ModerSpinner />}
                                    {!userNameValidationLoading && username.trim() !== '' && !usernameError && (
                                        <span className="text-green-500">&#10003;</span>
                                    )}
                                    {!userNameValidationLoading && username.trim() !== '' && usernameError && (
                                        <span className="text-red-500">&#10005;</span>
                                    )}
                                </div>
                                {usernameSuggestions.length > 0 && !userNameValidationLoading && (
                                    <div className="absolute z-10 left-0 mt-8 w-full bg-bg-color border rounded-md ">
                                        {usernameSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-2 hover:bg-secondary-bg-color cursor-pointer text-text-color"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {usernameError && (
                                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                            )}
                        </div>

                        <div className="w-full">
                            Email
                            <div className='flex items-center space-x-2'>
                                <Input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleEmailChange}
                                    className="rounded-lg focus:border-primary-600 block w-full p-2.5"
                                    disabled={emailValidator(profileData.userEmail)===null} //make email unchangeable if user has set an email
                                />
                                {formData.email!==profileData.userEmail && 
                                    <button 
                                        className="linearBorder p-2.5 linearText rounded-sms min-w-18"
                                        onClick={handleEmailVerification}
                                        disabled={isVerifyingEmail || isEmailVerified}
                                        type='button'
                                    >
                                        {isVerifyingEmail ? <ModerSpinner /> : isEmailVerified ? "Verified" : "Verify"}
                                    </button>
                                }
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1">{emailError}</p>
                            )}
                        </div>

                        <div className="w-full">
                            Phone Number
                            <div className='flex items-center space-x-2'>
                                <PhoneInput
                                    international
                                    defaultCountry="IN"
                                    label='Mobile No'
                                    type="text"
                                    name="mobileNo"
                                    id="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handlePhoneChange}
                                    autoComplete='off'
                                    className="linearInput rounded-lg focus:border-primary-600 block w-full p-2.5"
                                    disabled={profileData.userMobile!==""} //make phone unchangeable if user has set a number
                                />
                                {formData.mobileNo!==profileData.userMobile && 
                                    <button 
                                        className="linearBorder p-2.5 linearText rounded-sms min-w-18"
                                        onClick={handlePhoneVerification}
                                        disabled={isVerifyingPhone || isPhoneVerified}
                                        type='button'
                                    >
                                        {isVerifyingPhone ? <ModerSpinner /> : isPhoneVerified ? "Verified" : "Verify"}
                                    </button>
                                }
                            </div>
                            {mobileError && (
                                <p className="text-red-500 text-xs mt-1">{mobileError}</p>
                            )}
                        </div>

                        <div className="w-full">
                            <Input
                                label='Birth Date'
                                type="date"
                                name="birthDate"
                                id="birthDate"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                className="rounded-lg focus:border-primary-600 block w-full p-2.5"
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="gender" className="block mb-2 text-sm font-medium text-text-color">Gender</label>
                            <select
                                name="gender"
                                id="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="bg-bg-color border border-border-color text-text-color text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer Not To Say">Prefer Not To Say</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="profileBio" className="block mb-2 text-sm font-medium text-text-color">Profile Bio</label>
                            <textarea
                                name="profileBio"
                                id="profileBio"
                                value={formData.profileBio}
                                onChange={handleInputChange}
                                className="bg-bg-color border border-border-color text-text-color text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            />
                        </div>

                        <div className="w-full">
                            <Input
                                label='Website Link'
                                type="text"
                                name="websiteLink"
                                id="websiteLink"
                                value={formData.websiteLink}
                                onChange={handleInputChange}
                                className="rounded-lg focus:border-primary-600 block w-full p-2.5"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button type="submit" className="text-text-color border border-border-color font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            {loading ? <div className='flex items-center justify-center w-full'><ModerSpinner /></div> : "Save Changes"}
                        </button>
                        <button onClick={closeForm} type="button" className="text-red-600 inline-flex items-center hover:text-text-color border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Close Form
                        </button>
                    </div>
                </form>
                {showOtpInput && (
                    <div className='fixed inset-0 flex items-center justify-center z-50'>
                        <OtpInput
                            value={sendingOtpTo}
                            setOtpInput={setShowOtpInput}
                            onSubmit={handleOtpSubmit}
                            setOtpLoading={setOtpLoading}
                            otpLoading={otpLoading}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

export default EditProfileForm;