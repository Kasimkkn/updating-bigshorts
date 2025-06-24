import { TaggedUsers } from '@/models/postlistResponse';
import { Collaborator, getPostCollaborators } from '@/services/getpostcollaborators';
import useUserRedirection from '@/utils/userRedirection';
import { useEffect, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import FollowButton from '../FollowButton/FollowButton';
import { PostUsersModalSkeleton } from '../Skeletons/Skeletons';
import CommonModalLayer from './CommonModalLayer';
import useLocalStorage from '@/hooks/useLocalStorage';

interface PostUsersModalProps {
	taggedUsers: TaggedUsers[];
	onClose: () => void;
	postId: number;
	isForCollaborators?: boolean;
}

const PostUsersModal = ({ taggedUsers, onClose, postId, isForCollaborators = false }: PostUsersModalProps) => {
	const redirectUser = useUserRedirection();
	const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [id] = useLocalStorage<string>('userId', '');
  	const userId = id ? parseInt(id) : 0;

	async function fetchCollaborator(userId: any) {
		setIsLoading(true);
		try {
			const response = await getPostCollaborators({ postId: postId });
			if (response.isSuccess) {
				const users = Array.isArray(response.data) ? response.data : [];
				setCollaborators(users);
			}
		} catch (error) {
			console.error('Failed to fetch profile:', error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (isForCollaborators) {
			fetchCollaborator(postId)
		}
	}, [])

	return (
		<CommonModalLayer
			width='w-max'
			height='h-max'
			onClose={onClose}
			isModal={false}
			hideCloseButtonOnMobile={true}
		>
			<div className="flex bg-bg-color flex-col gap-3 md:rounded-xl text-text-color w-96 p-4 h-[55vh] shadow-md shadow-shadow-color">
				<h2 className="text-xl text-center font-semibold">{isForCollaborators ? "Collaborated users" : "Tagged Users"}</h2>

				<div className='w-full h-full overflow-y-auto'>
					{isForCollaborators ?
						isLoading ?
							<PostUsersModalSkeleton />
							:
							(collaborators.map((user) => {
								return (
									<div key={`user-${user.userId}`} className="flex justify-between mb-4 w-full">
										<div className='flex items-center gap-2'>
											<button
												onClick={() => {
													redirectUser(user.userId, `/home/users/${user.userId}`)
												}}
												className='flex items-center'>
												<Avatar src={user.userProfileImage} name={user.userFullName || user.userName} />
												<div className="ml-2 flex flex-col">
													<p className="font-bold text-text-color">{user.userFullName || user.userName}</p>
													<p className="text-start text-sm text-text-color">@{user.userName}</p>
												</div>
											</button>
										</div>
										{userId !== user.userId && (
											<FollowButton requestId={user.userId} isFollowing={user.isFollow} isForInteractiveImage={true} />
										)}
									</div>
								)
							})
							)
						: (
							taggedUsers.map((user) => {
								return (
									<div key={`user-${user.userId}`} className="flex justify-between mb-4 w-full">
										<div className='flex items-center gap-2'>
											<button
												onClick={() => {
													redirectUser(user.userId, `/home/users/${user.userId}`)
												}}
												className='flex items-center'>
												<Avatar src={user.userProfileImage} name={user.userFullName || user.userName} />
												<div className="ml-2 flex flex-col">
													<p className="font-bold text-text-color">{user.userFullName || user.userName}</p>
													<p className="text-start text-sm text-text-color">@{user.userName}</p>
												</div>
											</button>
										</div>
										{userId !== user.userId && (
											<FollowButton requestId={user.userId} isFollowing={user.isFollow} isForInteractiveImage={true} />
										)}
									</div>
								)
							})
						)}
				</div>
			</div>
		</CommonModalLayer>
	)
}

export default PostUsersModal