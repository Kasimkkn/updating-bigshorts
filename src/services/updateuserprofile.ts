import { CommonResponse } from "@/models/commonResponse";
import { getAuthToken } from "@/utils/getAuthtoken";
import EncryptionService from "./encryptionService";

interface EditProfileRequest {
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
    country_code?: string;
    // isPrivate: string;
    // isAllowNotification: string;
    // isAllowTagging: string;
}

interface EditProfileResponse extends CommonResponse<string> { }

async function editProfile(userData: EditProfileRequest): Promise<EditProfileResponse> {
    try {
        const encryptedData = await EncryptionService.encryptRequest(userData);
        let token = await getAuthToken()
        const response = await fetch('/api/updateuserprofile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(encryptedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EditProfileResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error Editing Profile failed:', error);
        throw error;
    }
}

export { editProfile }
export type { EditProfileRequest, EditProfileResponse }