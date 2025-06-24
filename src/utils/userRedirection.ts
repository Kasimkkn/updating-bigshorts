import useLocalStorage from "@/hooks/useLocalStorage";
import EncryptionService from "@/services/encryptionService";
import { useRouter } from "next/navigation";

async function getDecryptedUserId(): Promise<string> {
    try {
        const item = localStorage.getItem("userId");
        if (!item) return "";
        const parsed = JSON.parse(item);
        if (
            parsed &&
            typeof parsed === "object" &&
            parsed.isEncrypted &&
            parsed.iv &&
            parsed.data
        ) {
            const decryptedData = await EncryptionService.decryptResponse(parsed);
            if (
                decryptedData &&
                typeof decryptedData === "object" &&
                "valueToStore" in decryptedData
            ) {
                return decryptedData.valueToStore;
            }
            return decryptedData;
        }
        return parsed;
    } catch {
        return "";
    }
}

const useUserRedirection = () => {
    const router = useRouter();

    return async (userId: number, pathName: string) => {
        const loggedInUserId = await getDecryptedUserId();
        if (loggedInUserId == userId.toString() && pathName.includes("home/users")) {
            router.push("/home/profile");
            return null;
        } else {
            router.push(`${pathName}`);
        }
    };
};

export default useUserRedirection;
