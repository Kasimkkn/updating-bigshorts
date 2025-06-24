import { AudioData, HashTags, SearchData, UserData } from '@/models/searchResponse'
import React from 'react'
import AudioPosts from './AudioPosts'
import HastTags from './HastTags'
import UserPost from './UserPost'

const SearchPost: React.FC<SearchData & { searchInput: string }> = ({ data, searchInput }) => {

    if (!searchInput.trim()) {
        return null;
    }

    if (!data || data.length === 0) return null
    const hashTagsData = data.filter((item): item is HashTags => item.isFor === 'hashTag');
    const audioPostsData = data.filter((item): item is AudioData => item.isFor === 'Music');
    const userPostsData = data.filter((item): item is UserData => item.isFor === 'User');

    if (hashTagsData.length === 0 && audioPostsData.length === 0 && userPostsData.length === 0) {
        return (
            <div className="w-full md:px-3 text-center text-gray-500">
                <p>No results found for your search.</p>
            </div>
        );
    }

    return (
        <div className='w-full md:px-3'>
            {userPostsData.length > 0 && <UserPost data={userPostsData} />}
            {hashTagsData.length > 0 && <HastTags data={hashTagsData} />}
            {audioPostsData.length > 0 && <AudioPosts data={audioPostsData} />}
        </div>
    );
};


export default SearchPost;
