"use client"
import React, { createContext, useContext, useEffect, useCallback, ReactNode } from "react";
import { ProfileData } from "@/types/usersTypes";
import { getUserProfile } from "@/services/userprofile";
import useLocalStorage from "@/hooks/useLocalStorage";

interface UserProfileContextType {
    userData: ProfileData | null;
    userId: string;
    fetchUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useLocalStorage<ProfileData | null>('userData', null);
    const [userId] = useLocalStorage<string>('userId', '');

    const fetchUserData = useCallback(async () => {
        if (!userId) {
            return;
        }
        
        try {
            const response = await getUserProfile({ userId: parseInt(userId) });
            if (response.isSuccess) {
                const profileData = Array.isArray(response.data) ? response.data[0] : response.data;
                setUserData(profileData);
            } else {
                console.error("UserProfileContext: Error in getting user profile", response);
            }
        } catch (error) {
            console.error("UserProfileContext: Error in getting user profile", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Create the context value
    const value: UserProfileContextType = {
        userData,
        userId,
        fetchUserData
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};

// Custom hook to use the context
export const useUserProfile = (): UserProfileContextType => {
    const context = useContext(UserProfileContext);
    
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    
    return context;
};