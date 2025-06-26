import { useState } from 'react';
import { ViewReactionsData } from '@/models/viewReactionsResponse';
import { ViewReactionsPostData } from '@/models/viewReactionsPostResponse';

export const usePostModals = () => {
    const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
    const [postInsightsModalCoverfile, setPostInsightsModalCoverfile] = useState<{ image: string, aspect: number }>({ image: '', aspect: 0 });
    const [insightsData, setInsightsData] = useState<ViewReactionsData | null>(null);
    const [postInsightsData, setPostInsightsData] = useState<ViewReactionsPostData | null>(null);
    const [isPostUsersModalOpen, setIsPostUsersModalOpen] = useState<{ postId: number, isForCollaborators: boolean } | null>(null);
    const [contentTreeOpen, setContentTreeOpen] = useState<{ postId: number } | null>(null);

    const closeAllModals = () => {
        setOpenMoreOptions(null);
        setIsModalOpen(false);
        setIsPostsModalOpen(false);
        setInsightsData(null);
        setPostInsightsData(null);
        setIsPostUsersModalOpen(null);
        setContentTreeOpen(null);
        setPostInsightsModalCoverfile({ image: '', aspect: 0 });
    };

    return {
        openMoreOptions,
        setOpenMoreOptions,
        isModalOpen,
        setIsModalOpen,
        isPostsModalOpen,
        setIsPostsModalOpen,
        postInsightsModalCoverfile,
        setPostInsightsModalCoverfile,
        insightsData,
        setInsightsData,
        postInsightsData,
        setPostInsightsData,
        isPostUsersModalOpen,
        setIsPostUsersModalOpen,
        contentTreeOpen,
        setContentTreeOpen,
        closeAllModals
    };
};