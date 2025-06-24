import React, { useEffect, useState } from "react";
import CommonModalLayer from "./CommonModalLayer";
import Avatar from "../Avatar/Avatar";
import { FaUserCircle } from "react-icons/fa";
import { IoCalendarClearOutline } from "react-icons/io5";
import { getAboutProfile, UserProfile } from "@/services/aboutprofile";
import { AboutThisAccountSkeleton } from "../Skeletons/Skeletons";

interface AboutAccountModalProps {
  userId: number;
  onClose: () => void;
}
const AboutAccountModal = ({ onClose, userId }: AboutAccountModalProps) => {
  const [profileData, setProfileData] = useState<UserProfile>({
    username: "",
    profileimage: "",
    name: "",
    isverified: false,
    createdAt: "",
    gender: "",
    pronouns: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const creationDate = new Date(profileData.createdAt);
  const date = creationDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchDetails = async (userId: number) => {
    setIsLoading(true);
    try {
      if (!userId) return;
      const res = await getAboutProfile({ userId: userId });
      if (res.isSuccess) {
        const data = res.data;
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error liking the video:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(userId);
  }, [userId]);

  return (
    <CommonModalLayer width="w-max" height="h-max" onClose={onClose} isModal={true} hideCloseButtonOnMobile={true}>
      <div className="flex bg-primary-bg-color md:rounded-xl w-80 md:w-96 flex-col gap-3 text-text-color p-4 relative">
        <h2 className="text-xl text-center font-semibold">
          About This Account
        </h2>

        {isLoading ? (
          <AboutThisAccountSkeleton />
        ) : (
          <>
            <div className="flex items-center">
              <Avatar
                src={profileData?.profileimage}
                width="w-20"
                height="h-20"
                name="Dhyaan Shah"
              />
              <div className="flex flex-col ml-3">
                <p className="text-xl font-semibold">{profileData?.name}</p>
                <p className="text-sm">@{profileData?.username}</p>
              </div>
            </div>

            <p className="text-lg font-semibold">Account Information</p>

            <div className="flex items-center">
              <FaUserCircle size={30} />
              <div className="flex flex-col ml-3">
                <p className="text-sm">Gender</p>
                <p className="text-md font-semibold">
                  {profileData?.gender
                    ? profileData.gender.charAt(0).toUpperCase() +
                    profileData.gender.slice(1).toLowerCase()
                    : ""}
                </p>
              </div>
            </div>

            <p className="text-lg font-semibold">Account History</p>

            <div className="flex items-center">
              <IoCalendarClearOutline size={30} />
              <div className="flex flex-col ml-3">
                <p className="text-sm">Joined</p>
                <p className="text-md font-semibold">{date}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </CommonModalLayer>
  );
};

export default AboutAccountModal;
