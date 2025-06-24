import { getSuggestionOfUser } from '@/services/suggestionlistforuser';
import { SuggestionListForUserData } from '@/types/usersTypes';
import React, { useEffect, useState } from 'react'
import Avatar from '../Avatar/Avatar';
import useUserRedirection from '@/utils/userRedirection';
import { TiTickOutline } from 'react-icons/ti';
import { FaUserPlus } from 'react-icons/fa';
import { ModerSpinner } from '../LoadingSpinner';
import { SuggestedProfilesSkeleton } from '../Skeletons/Skeletons';

interface SuggestedProfilesProps {
	userId: number;
}
const SuggestedProfiles = ({ userId }: SuggestedProfilesProps) => {
	const redirectUser = useUserRedirection();
	const [suggestionLoading, setSuggestionLoading] = useState(false);
	const [suggestionData, setSuggestionData] = useState<SuggestionListForUserData[]>([]);

	useEffect(() => {
		async function getSuggestions() {
			try {
				setSuggestionLoading(true);
				const response = await getSuggestionOfUser({ userId: userId });
				const sugesstion = Array.isArray(response.data) ? response.data : [];
				setSuggestionData(sugesstion);
				setSuggestionLoading(false);
			} catch (error) {
setSuggestionLoading(false);
			}
		}

		getSuggestions();
	}, [])

	return (
		<div className='w-full flex flex-col gap-2'>
			<h5 className='text-base font-bold'>Suggestion</h5>
			{suggestionLoading ? (
				<SuggestedProfilesSkeleton />
			) : (
				<div className='flex md:gap-3 overflow-x-auto scrollbar-hide'>
					{suggestionData.map((user, index) => (
						<div
							key={index}
							className='flex gap-2 px-1 flex-col items-center md:min-w-[100px] min-w-[90px] overflow-hidden relative'
						>
							<Avatar src={user?.userProfileImage} width='w-20' height='h-28' name={user?.userFullName} />

							<button
								onClick={() => {
									redirectUser(user?.userId, `/home/users/${user?.userId}`)
								}}
								className='text-xs md:text-sm text-ellipsis whitespace-nowrap overflow-hidden w-full truncate'>
								{user.userFullName ? user.userFullName : user.userName}
							</button>
							<button className='absolute z-40 bottom-4 border-border-color  border linearBtn w-8 h-8 flex items-center justify-center rounded-full'>
								{user.isRequested ? (
									<TiTickOutline className="text-sm font-light text-text-color max-md:text-xs" />
								) : (
									<FaUserPlus className="text-sm font-light text-text-color max-md:text-xs" />
								)}
							</button>
						</div>
					))}
				</div>
			)
			}
		</div>
	)
}

export default SuggestedProfiles