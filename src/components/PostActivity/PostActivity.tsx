import React, { useEffect, useState } from 'react'
import { LiaPlaySolid } from "react-icons/lia";
import userlogo from '@/assets/user.png';
import Image from 'next/image';
import { IoStarSharp } from 'react-icons/io5';
import { FaChevronLeft } from 'react-icons/fa';
import { getLikeDetails, LikeMessage } from '@/services/getlikedetails';
import SafeImage from '../shared/SafeImage';

const dummy = {
    plays: 41,
    likes: [
        { fullName: 'Kshitiz Sharma', userName: 'kshitizz', profilePicture: 'url' },
        { fullName: 'Ananya Gupta', userName: 'ananya123', profilePicture: 'url2' },
        { fullName: 'Rahul Verma', userName: 'rahulv', profilePicture: 'url3' },
        { fullName: 'Priya Singh', userName: 'priya_s', profilePicture: 'url4' },
        { fullName: 'Aarav Mehta', userName: 'aarav.m', profilePicture: 'url5' },
        { fullName: 'Ishita Roy', userName: 'ishitar', profilePicture: 'url6' },
        { fullName: 'Rohan Desai', userName: 'rohandesai', profilePicture: 'url7' },
        { fullName: 'Sanya Kapoor', userName: 'sanyak', profilePicture: 'url8' },
        { fullName: 'Arjun Malik', userName: 'arjunmalik', profilePicture: 'url9' },
        { fullName: 'Neha Jain', userName: 'nehaj', profilePicture: 'url10' },
        { fullName: 'Aditya Bhatt', userName: 'adityab', profilePicture: 'url11' },
        { fullName: 'Kshitiz Sharma', userName: 'kshitizz', profilePicture: 'url' },
        { fullName: 'Ananya Gupta', userName: 'ananya123', profilePicture: 'url2' },
        { fullName: 'Rahul Verma', userName: 'rahulv', profilePicture: 'url3' },
        { fullName: 'Priya Singh', userName: 'priya_s', profilePicture: 'url4' },
        { fullName: 'Aarav Mehta', userName: 'aarav.m', profilePicture: 'url5' },
        { fullName: 'Ishita Roy', userName: 'ishitar', profilePicture: 'url6' },
    ]
}

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