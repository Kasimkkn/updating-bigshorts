import useLocalStorage from '@/hooks/useLocalStorage';
import { commentPinReportDelete } from '@/services/commentpinreportdelete';
import { flixCommentPinReportDelete } from '@/services/flixcommentpinreportdelete';
import { PostCommentListResponse } from '@/services/postcommentlist';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { FaRegFlag } from 'react-icons/fa';
import { ImBlocked } from 'react-icons/im';
import { MdDeleteOutline } from 'react-icons/md';
import { TiPinOutline } from 'react-icons/ti';

interface OptionType {
    name: string,
    icon: JSX.Element
}

interface EllipsisMenuProps {
    data: PostCommentListResponse,
    onClose: () => void,
    isLoggedInPostOwner?: boolean,
    updateComments: (property: string, commentId: number, replyId:number) => void
    isFlix?: boolean,
    replyId?: number
}
const EllipsisMenu = ({ onClose, data, isLoggedInPostOwner , updateComments, isFlix = false, replyId=0}: EllipsisMenuProps) => {
    const [userId] = useLocalStorage<string>('userId', '');
    const menuRef = useRef<HTMLDivElement>(null);

    let replyUserId;
    let options: OptionType[]
    
    const optionsIfPostByUser = [
        { name: data.is_pin ?  "Unpin" : "Pin", icon: <TiPinOutline /> },
        {name: "Report", icon: <FaRegFlag />},
        { name: "Delete",  icon: <MdDeleteOutline style={{ color: 'red' }} /> },
    ]
    const optionsIfPostByUserAndCommentByUser = [
        { name: data.is_pin ?  "Unpin" : "Pin", icon: <TiPinOutline /> },
        { name: "Delete",  icon: <MdDeleteOutline style={{ color: 'red' }} /> },
    ]
    const optionsIfPostNotByUser = [
        {name: "Report", icon: <FaRegFlag />},
    ]

    const optionsIfPostNotByUserAndCommentByUser = [
        { name: "Delete",  icon: <MdDeleteOutline style={{ color: 'red' }} /> },
    ]


    if(replyId!==0){
        replyUserId = data.replyData.find(r => r.replyId === replyId)?.userId.toString();
    }

    if(replyUserId){
        options = isLoggedInPostOwner ? (
            replyUserId === userId ? optionsIfPostByUserAndCommentByUser : optionsIfPostByUser
        ) : (
            replyUserId === userId ? optionsIfPostNotByUserAndCommentByUser : optionsIfPostNotByUser
        )
    } else{
        options = isLoggedInPostOwner ? (
            data.userId.toString() === userId ? optionsIfPostByUserAndCommentByUser : optionsIfPostByUser
        ) : (
            data.userId.toString() === userId ? optionsIfPostNotByUserAndCommentByUser : optionsIfPostNotByUser
        )
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOptionClick = (optionName: string) => {
        switch (optionName) {
            case 'Delete':
                handleDelete(data.postId, data.commentId, 2, replyId);
                break;
            case 'Report':
                handleReport(data.commentId);
break;
            case 'Pin':
                handlePin(data.postId, data.commentId, 0)
                break;
            case 'Unpin':
                handlePin(data.postId, data.commentId, 3)
                break;
        }
    }
    const handleDelete = async (postId: number, commentId:number, commentType = 2, replyId: number) => {
        try {
            let payload
            if(replyId !== 0) {
                payload = {postId, commentId, commentType, replyId}
            } else{payload = {postId, commentId, commentType}}

            const res = isFlix ? await flixCommentPinReportDelete(payload) : await commentPinReportDelete(payload);
            if (res.isSuccess) {
updateComments('delete',commentId, replyId)
                onClose();
            }
        } catch (error) {
        }
    }

    const handlePin = async (postId: number, commentId:number, commentType:number) => {
        try {
            const res = isFlix ? await flixCommentPinReportDelete({postId, commentId, commentType}) : await commentPinReportDelete({ postId, commentId, commentType });
            if (res.isSuccess) {
updateComments('pin',commentId, replyId)
                onClose();
            }
        } catch (error) {
        }
    }

    const handleReport = (commentId:number)=>{
        //Open report modal upstream
        updateComments('report', commentId, replyId); 
        onClose();
    }

    return (
        <div ref={menuRef} className="absolute right-0 bg-bg-color z-50 rounded-sm shadow-sm">
            <ul className="text-sm">
                {options.map((option, i) => {
                    return (
                        <li key={i}>
                            <button 
                                className="w-full text-left hover:bg-primary-bg-color flex gap-3 items-center p-2"
                                onClick={()=>handleOptionClick(option.name)}
                            >
                                {option.icon}
                                <p className="text-text-color">{option.name}</p>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default EllipsisMenu