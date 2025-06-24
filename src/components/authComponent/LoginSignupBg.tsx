import Image from 'next/image'
import React, { useState } from 'react'
import lgbg from '@/assets/lgbg.png'
import { ModerSpinner } from '@/components/LoadingSpinner'
import SafeImage from '../shared/SafeImage'
const LoginSignupBg = () => {
    const [isLoading, setIsLoading] = useState(true)

    const handleImageLoaded = () => {
        setIsLoading(false)
    }

    return (
        <div className='w-1/2 max-md:hidden'>
            {isLoading && (
                <div className="flex items-center justify-center w-full h-full">
                    <ModerSpinner />
                </div>
            )}
            <SafeImage
                src={lgbg.src}
                alt="Login/Signup Background"
                className={`object-cover w-full h-full `}
                onLoad={handleImageLoaded}
            />
        </div>
    )
}

export default LoginSignupBg