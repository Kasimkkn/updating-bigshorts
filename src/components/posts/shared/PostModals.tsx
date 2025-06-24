import React from 'react';
import InsightsModal from '../../Insights/Insights';
import PostInsightsModal from '../../Insights/PostInsights';
import ReportModal from '../../modal/ReportModal';
import AboutAccountModal from '../../modal/AboutAccountModal';
import PostUsersModal from '../../modal/PostUsersModal';
import { ViewReactionsData } from '@/models/viewReactionsResponse';
import { ViewReactionsPostData } from '@/models/viewReactionsPostResponse';

interface PostModalsProps {
    isModalOpen: boolean;
    insightsData: ViewReactionsData | null;
    postInsightsModalCoverfile: string;
    onInsightsClose: () => void;
    fecthVideoPostInsights: (postId: number, videoId: number) => Promise<void>;
    isPostsModalOpen: boolean;
    postInsightsData: ViewReactionsPostData | null;
    aspect: number;
    onPostInsightsClose: () => void;
    isReportModalOpen: number | null;
    onReportClose: () => void;
    isAboutAccountModalOpen: number | null;
    onAboutAccountClose: () => void;
    isPostUsersModalOpen: { postId: number; isForCollaborators: boolean } | null;
    taggedUsers: any[];
    onPostUsersClose: () => void;
}

const PostModals: React.FC<PostModalsProps> = ({
    isModalOpen,
    insightsData,
    postInsightsModalCoverfile,
    onInsightsClose,
    fecthVideoPostInsights,
    isPostsModalOpen,
    postInsightsData,
    aspect,
    onPostInsightsClose,
    isReportModalOpen,
    onReportClose,
    isAboutAccountModalOpen,
    onAboutAccountClose,
    isPostUsersModalOpen,
    taggedUsers,
    onPostUsersClose
}) => {
    return (
        <>
            {isModalOpen && insightsData && (
                <InsightsModal
                    isOpen={isModalOpen}
                    onClose={onInsightsClose}
                    data={insightsData}
                    fecthVideoPostInsights={fecthVideoPostInsights}
                    postInsightsModalCoverfile={postInsightsModalCoverfile}
                />
            )}

            {isPostsModalOpen && postInsightsData && (
                <PostInsightsModal
                    isOpen={isPostsModalOpen}
                    onClose={onPostInsightsClose}
                    data={postInsightsData}
                    postInsightsModalCoverfile={postInsightsModalCoverfile}
                    aspect={aspect}
                />
            )}

            {isReportModalOpen && (
                <ReportModal
                    postId={isReportModalOpen}
                    onClose={onReportClose}
                />
            )}

            {isAboutAccountModalOpen && (
                <AboutAccountModal
                    userId={isAboutAccountModalOpen}
                    onClose={onAboutAccountClose}
                />
            )}

            {isPostUsersModalOpen && (
                <PostUsersModal
                    taggedUsers={taggedUsers}
                    onClose={onPostUsersClose}
                    postId={isPostUsersModalOpen.postId}
                    isForCollaborators={isPostUsersModalOpen.isForCollaborators}
                />
            )}
        </>
    );
};

export default PostModals;

