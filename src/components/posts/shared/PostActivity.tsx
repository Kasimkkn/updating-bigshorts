import userlogo from '@/assets/user.png';
import { getLikeDetails, LikeMessage } from '@/services/getlikedetails';
import { useEffect, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { IoStarSharp } from 'react-icons/io5';
import { LiaPlaySolid } from "react-icons/lia";
import SafeImage from '../../shared/SafeImage';

interface PostActivityProps {
    postId: number,
    closeModal: () => void;
}
const PostActivity = ({ closeModal, postId }: PostActivityProps) => {
    const [likeData, setLikeData] = useState<LikeMessage | null>(null)

    const fetchDetails = async (postId: number) => {
        try {
            if (!postId) return;

            const res = await getLikeDetails({ postId: postId })
            if (res.isSuccess) {
                const data = res.message
                setLikeData(data)
            }

        } catch (error) {
            console.error('Error liking the video:', error);
        }
    }

    useEffect(() => {
        fetchDetails(postId)
    }, [postId]);

    return (
        <div className="rounded-lg bg-bg-color p-3 h-full overflow-hidden">

            <div className="flex gap-5 mb-4 items-center">
                <FaChevronLeft size={20} onClick={closeModal} />
                <span className="font-bold">Likes</span>
            </div>

            <div className='flex justify-center font-bold m-4'>
                <LiaPlaySolid size={20} />
                <p>{likeData?.totalViews} Plays</p>
            </div>

            <div className='flex flex-col gap-2  h-full overflow-y-auto'>
                {likeData?.firstThreeUsers.map((user, index) => {
                    return (
                        <div key={index} className='flex justify-between'>
                            <div className='flex gap-2'>
                                <SafeImage
                                    src={user.profileimage ? user.profileimage : (typeof userlogo === 'string' ? userlogo : userlogo.src)}
                                    alt='profile picture'
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className=''>
                                    <p className='text-xl'>{user.name && user.name !== "" ? user.name : user.username}</p>
                                    <p>{user.username}</p>
                                </div>
                            </div>
                            <IoStarSharp className="text-2xl text-text-color text-yellow-500 mb-[2px]" />
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default PostActivity