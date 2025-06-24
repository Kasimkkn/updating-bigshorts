import React from 'react';
import TextWidget from '../../Interactive/TextWidget';
import ImageWidget from '../../Interactive/ImageWidget';
import LinkWidget from '../../Interactive/LinkWidget';
import LocationWidget from '../../Interactive/LocationWidget';

interface StoryInteractiveElementsProps {
    interactiveData: any;
    duration: number;
}

export const StoryInteractiveElements: React.FC<StoryInteractiveElementsProps> = ({
    interactiveData,
    duration
}) => {
    if (!interactiveData?.functionality_datas) return null;

    return (
        <>
            {/* Text Elements */}
            {interactiveData.functionality_datas.list_of_container_text?.map((text: any, i: number) => (
                <TextWidget
                    key={`text-${i}`}
                    index={i}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allText={interactiveData.functionality_datas.list_of_container_text}
                />
            ))}

            {/* Image Elements */}
            {interactiveData.functionality_datas.list_of_images?.map((image: any, i: number) => (
                <ImageWidget
                    key={`image-${i}`}
                    goToPosition={() => { }}
                    i={i}
                    playPauseController={() => { }}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allImages={interactiveData.functionality_datas.list_of_images}
                />
            ))}

            {/* Link Elements */}
            {interactiveData.functionality_datas.list_of_links?.map((link: any, i: number) => (
                <LinkWidget
                    key={`link-${i}`}
                    i={i}
                    videoDuration={duration}
                    forHomeTrendingList={false}
                    allLinks={interactiveData.functionality_datas.list_of_links}
                />
            ))}

            {/* Location Elements */}
            {interactiveData.list_of_locations?.map((location: any, i: number) => (
                <LocationWidget
                    i={i}
                    key={i + 1}
                    playPauseController={() => { }}
                    location={location}
                    parentHeight={750}
                    parentWidth={350}
                />
            ))}
        </>
    );
};