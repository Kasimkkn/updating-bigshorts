import React, { useState } from 'react'
import CommonModalLayer from './CommonModalLayer'
import { savePostReport } from '@/services/savepostreport';
import toast from 'react-hot-toast';
import { commentPinReportDelete } from '@/services/commentpinreportdelete';
import { flixCommentPinReportDelete } from '@/services/flixcommentpinreportdelete';
import Button from '../shared/Button';
import { reportUser, ReportUserRequest } from '@/services/reportUser';
import useLocalStorage from '@/hooks/useLocalStorage';

interface ReportModalProps {
    postId?: number;
    onClose: () => void;
    commentId?: number | null;
    isFlix?: boolean;
    replyId?: number;
    userId?: number;
}

interface CommentReportRequestData {
    postId: number,
    commentId: number,
    replyId?:number,
    commentType: number,
    report?: string,
    reportType?: string,
}

interface PostReportRequestData {
    postId: number;
    reportType: string;
    comment: string;
    email: string;
    phone: string;
}

const ReportModal = ({ postId, onClose, commentId = null, isFlix = false, replyId=0, userId }: ReportModalProps) => {
    const [reportType, setReportType] = useState<string | null>(null);
    const [comment, setComment] = useState<string>("");
    const [userData] = useLocalStorage<any>('userData', {});

    const handleSubmit = async () => {
        if (reportType === null) {
            toast.error("Please enter a report type")
            return;
        }

        try {
            let response;
            if (commentId !== null && postId) {
                const commentReportReqData: CommentReportRequestData = {
                    postId,
                    commentId,
                    commentType: 1,
                    report: comment,
                    reportType,
                    ...(replyId !== 0 && { replyId }),
                };
                response = isFlix ? await flixCommentPinReportDelete(commentReportReqData) : await commentPinReportDelete(commentReportReqData);
            } else if (postId) {
                const postReportReqData: PostReportRequestData = {
                    postId,
                    reportType,
                    comment,
                    email: userData?.userEmail || '',
                    phone: userData?.userMobile || ''
                };
                response = await savePostReport(postReportReqData);
            } else if (userId){
                const userReportReqData: ReportUserRequest = {
                    reportuserId: userId,
                    reportType,
                    comment,
                    email: userData?.userEmail || '',
                    phone: userData?.userMobile || ''
                };
                response = await reportUser(userReportReqData);
            }
            if (response?.isSuccess) {
                toast.success(
                    "Reported Successfully"
                );
            }
            onClose();
        } catch (error) {
            toast.error("Failed to report. Please try again later.");
        }
    }

    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
            onClose={onClose}
            isModal={false}
            hideCloseButtonOnMobile={true}
        >
            <div className='flex flex-col bg-primary-bg-color h-full w-full max-w-4xl p-4 md:rounded-xl'
            >

                <p className='text-text-color text-2xl md:text-center mb-3'>Report</p>

                <div
                    className='max-md:pb-4'
                    style={{ maxHeight: '65vh', overflowY: 'auto' }}
                >
                    <p className='text-text-color text-lg'>Help us understand why do you want to report this</p>

                    <div className='p-4 flex flex-col w-full gap-3'>
                        <label className="flex items-center gap-2">
                            <input type='radio' checked={reportType === '0'} value={0} className='cursor-pointer' onChange={(e) => setReportType(e.target.value)} /> Inappropriate Content
                        </label>

                        <label className="flex items-center gap-2">
                            <input type='radio' checked={reportType === '1'} value={1} onChange={(e) => setReportType(e.target.value)} /> Hateful Or Abusive Content
                        </label>

                        <label className="flex items-center gap-2">
                            <input type='radio' checked={reportType === '2'} value={2} onChange={(e) => setReportType(e.target.value)} /> Copyright/Trademark Infringe
                        </label>

                        <label className="flex items-center gap-2">
                            <input type='radio' checked={reportType === '3'} value={3} onChange={(e) => setReportType(e.target.value)} /> Spam or Misleading
                        </label>

                        <label className="flex items-center gap-2">
                            <input type='radio' checked={reportType === '4'} value={4} onChange={(e) => setReportType(e.target.value)} /> Content not Visible/Playable
                        </label>

                        <label className="flex items-center gap-3">
                            <input type='radio' checked={reportType === '5'} value={5} onChange={(e) => setReportType(e.target.value)} /> Other/Content
                        </label>
                    </div>

                    <p className='text-text-color text-lg'>Comment</p>
                    <textarea
                        name="report comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="bg-bg-color border h-44 border-border-color text-text-color text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    />

                    <Button
                        isLinearBtn={true}
                        onClick={handleSubmit} className='w-full linearBtn rounded-md mt-4 text-lg'>Submit</Button>
                </div>
            </div>
        </CommonModalLayer>
    )
}

export default ReportModal