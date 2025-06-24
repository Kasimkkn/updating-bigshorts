import React from 'react'
import { HashTags } from '@/models/searchResponse'
import { FaHashtag } from "react-icons/fa";

interface HastTagsProps {
    data: HashTags[];
}

const HastTags: React.FC<HastTagsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1">
    {data.map((hashTag) => (
        <div
            key={hashTag.id}
            className="flex items-center justify-between p-4 bg-primary-bg-color rounded-md border-b border-border-color"
        >
            {/* Hashtag Info Section */}
          <div className="flex items-center gap-4">
            {/* Hashtag Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-color">
              <FaHashtag className="text-lg text-text-color" />
            </div>

            {/* Hashtag Name */}
            <div className="flex flex-col">
              <h4 className="text-sm text-text-color">{hashTag.name}</h4>
            </div>
          </div>
        </div>
    ))}
</div>
    )
}

export default HastTags;
