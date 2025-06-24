import React, { useEffect, useState } from "react";
import {
  BiSolidMessageSquareDetail,
  BiShare,
  BiHeart,
  BiStar,
  BiBookmark,
  BiChevronDown,
} from "react-icons/bi";
import CommonModalLayer from "./CommonModalLayer";
import { getAccountOverview } from "@/services/accountoverview";
import { AccountOverviewResponse } from "@/models/accountOverviewResponse";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => (
  <div className="bg-secondary-bg-color rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="text-text-color text-xl">{icon}</div>
      <span className="text-text-color text-sm font-medium">{label}</span>
    </div>
    <span className="text-text-color font-semibold">{value}</span>
  </div>
);

interface InteractionItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const InteractionItem: React.FC<InteractionItemProps> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border-color">
    <div className="flex items-center gap-3">
      <div className="text-text-color text-xl">{icon}</div>
      <span className="text-text-color">{label}</span>
    </div>
    <span className="text-text-color">{value}</span>
  </div>
);

interface AccountOverviewModalProps {
  onClose?: () => void;
  userId: number;
}

const AccountOverviewModal = ({
  onClose,
  userId,
}: AccountOverviewModalProps) => {
  const [overviewData, setOverviewData] =
    useState<AccountOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const durationOptions = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
    { label: "All Time", value: 365 },
  ];

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setIsLoading(true);
        const response = await getAccountOverview(selectedDuration);
        setOverviewData(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch account overview data");
        console.error("Error fetching account overview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, [selectedDuration]);

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setIsDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <CommonModalLayer width="max-w-3xl" height="h-max" onClose={onClose} hideCloseButtonOnMobile={true}>
        <div className="bg-primary-bg-color rounded-xl w-full max-w-4xl p-4">
          <div className="text-text-color">Loading...</div>
        </div>
      </CommonModalLayer>
    );
  }

  if (error || !overviewData) {
    return (
      <CommonModalLayer width="max-w-3xl" height="h-max" onClose={onClose}
        hideCloseButtonOnMobile={true}
      >
        <div className="bg-primary-bg-color rounded-xl w-full max-w-4xl p-4">
          <div className="text-text-color">
            {error || "Failed to load data"}
          </div>
        </div>
      </CommonModalLayer>
    );
  }

  const { data } = overviewData;

  return (
    <CommonModalLayer
      width="max-w-3xl"
      height="h-max"
      isModal={false}
      onClose={onClose}
      hideCloseButtonOnMobile={true}
    >
      <div className="bg-primary-bg-color rounded-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold text-text-color">
            Account Overview
          </h2>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 linearText cursor-pointer"
            >
              {selectedDuration === 365
                ? "All Time"
                : `${selectedDuration} days`}
              <BiChevronDown
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""
                  }`}
                size={30}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 py-2 w-32 bg-secondary-bg-color rounded-lg shadow-sm z-50">
                {durationOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-hover-color cursor-pointer text-text-color"
                    onClick={() => handleDurationSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
            <StatsCard
              icon={<BiSolidMessageSquareDetail />}
              label="Total Content"
              value={data.totalPost + data.totalFlix}
            />
            <StatsCard
              icon={<BiShare />}
              label="Content Shared"
              value={data.contentShared}
            />
            <StatsCard
              icon={<BiHeart />}
              label="Total Engagement"
              value={data.totalEngagement}
            />
            <StatsCard
              icon={<BiHeart />}
              label="Accounts Reached"
              value={data.accountsReached}
            />
          </div>

          <div className="p-4 border-t border-border-color rounded-b-xl">
            <h3 className="text-lg font-medium text-text-color mb-4">
              Interaction Details
            </h3>
            <div className="space-y-2">
              <InteractionItem
                icon={<BiStar />}
                label="Snip Likes"
                value={
                  data.distinctUserInteractions?.postInteractions.videoLikeUsers
                }
              />
              <InteractionItem
                icon={<BiStar />}
                label="Shot Likes"
                value={
                  data.distinctUserInteractions.postInteractions.postLikeUsers
                }
              />
              <InteractionItem
                icon={<BiSolidMessageSquareDetail />}
                label="Content Comments"
                value={
                  data.distinctUserInteractions.postInteractions
                    .postCommentUsers +
                  data.distinctUserInteractions.flixInteractions
                    .flixCommentUsers
                }
              />
              <InteractionItem
                icon={<BiBookmark />}
                label="Content Saves"
                value={
                  data.distinctUserInteractions.postInteractions.postSaveUsers +
                  data.distinctUserInteractions.flixInteractions.flixSaveUsers
                }
              />
              <InteractionItem
                icon={<BiShare />}
                label="Content Shares"
                value={
                  data.distinctUserInteractions.postInteractions
                    .postShareUsers +
                  data.distinctUserInteractions.flixInteractions.flixShareUsers
                }
              />
            </div>
          </div>
        </div>
      </div>
    </CommonModalLayer>
  );
};

export default AccountOverviewModal;
