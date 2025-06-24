import { canvasHeight, canvasWidth } from "@/constants/interactivityConstants";
import { useInAppRedirection } from "@/context/InAppRedirectionContext";
import { ImageSaved } from "@/types/savedTypes";
import useUserRedirection from "@/utils/userRedirection";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import Avatar from "../Avatar/Avatar";
import TextWidget from "../Interactive/TextWidget";
import SharedSsupViewer from "./StoryModalSsup";
import SnippageSnup from "./snipinssupplayer";
import { HiMiniSpeakerWave } from "react-icons/hi2";

interface SnipInStoryProps {
	postShare: any;
	isTimerPaused: boolean;
	isMuted?: boolean;
	toggleMute?: () => void;
}

const PostInStory = ({ postShare, isTimerPaused, isMuted, toggleMute }: SnipInStoryProps) => {
	const { setInAppSnipsData, setProfilePostData } = useInAppRedirection();
	const router = useRouter();
	const redirectUser = useUserRedirection();
	const scale = postShare?.scale || 1;;
	const [postData, setPostData] = useState<ImageSaved | null>(null);

	// positioning of the post in the story
	const parentRef = useRef<HTMLDivElement>(null);
	const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
	const [postHeight, setPostHeight] = useState(canvasHeight);
	const [postWidth, setPostWidth] = useState(canvasWidth);
	const [videoUrl, setVideoUrl] = useState("");
	const postContainerWidth = parentSize.width;
	const postContainerHeight = parentSize.width * canvasHeight / canvasWidth; //maintain aspect ratio

	const scalingFactorY = (postContainerHeight - postHeight) / 32;  //top = positionY*scalingFactor + (postContainerHeight - postHeight)/2

	const scalingFactorX = (postContainerWidth - postWidth) / 24;  //left = (positionX - 6) * scalingFactorX


	const top = postShare.positionY ? postShare.positionY : 0; //0 for center
	const left = postShare.positionX ? postShare.positionX : 6; //6 for center
	const calculatedTop = Math.max(top * scalingFactorY + (postContainerHeight - postHeight) / 2, 0);
	const calculatedLeft = Math.max((left - 6) * scalingFactorX, 0);


	const isStory = postShare?.ssupItem ? true : false;
	const postItem = isStory ? postShare.ssupItem : postShare.snipItem;
	const videoUrl1 = useMemo(() => {
		try {
			const interactiveVideoArray = JSON.parse(
				postShare?.ssupItem
					? postShare.ssupItem.stories?.[0]?.interactiveVideo || "[]"
					: postShare.snipItem.interactiveVideo || "[]"
			);

			if (interactiveVideoArray && interactiveVideoArray[0]?.path) {
				return interactiveVideoArray[0].path
					.replace("/hls/master.m3u8", "")
					.replace("https://d1332u4stxguh3.cloudfront.net/", "/video/");
			}
			return "";
		} catch (error) {
			console.error("Video URL parsing error:", error);
			return "";
		}
	}, [postShare]);


	useEffect(() => {
		const updateSize = () => {
			if (parentRef.current) {
				setParentSize({
					width: parentRef.current.clientWidth,
					height: parentRef.current.clientHeight,
				});
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	useEffect(() => {
		if (parentSize.width > 0) {
			const containerHeight = parentSize.width * canvasHeight / canvasWidth;
			setPostWidth(75 / 100 * parentSize.width);
			setPostHeight(80 / 100 * containerHeight);
		}
	}, [parentSize, scale]);

	const handleRedirection = () => {
		if (postItem.isForInteractiveVideo) {
			setInAppSnipsData([postItem]);
			router.push('/home/snips');
		} else {
			setProfilePostData([postItem]);
			router.push('/home/posts');
		}
	}


	const renderSsupItem = () => {
		const story = postItem.stories[0];
		const interactiveVideo = JSON.parse(story.interactiveVideo)[0];
		const backgroundImage = postItem.stories[0].coverFile;
		return (
			<div className="relative">
				{/* Blurred background cover image */}
				<div
					className="absolute inset-0 z-0 overflow-hidden"
					style={{
						backgroundImage: `url(${backgroundImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						filter: 'blur(15px)',
						transform: 'scale(1.1)', // Prevent blur edges from showing
						opacity: 0.7
					}}
				></div>


				<div
					className="absolute z-10 cursor-pointer drop-shadow-md rounded-md"
					onClick={() => {
						if (postItem.isForInteractiveVideo) {
							setInAppSnipsData([postItem]);
							router.push('/home/snips');
						} else {
							setProfilePostData([postItem]);
							router.push('/home/posts');
						}
					}}
					style={{
						left: `${calculatedLeft}px`,
						top: `${calculatedTop}px`,
						width: `${postWidth}px`,
						height: `${postHeight}px`
					}}
				>	
				{postItem.stories[0].isForInteractiveVideo && (
					<>
						<div className="absolute top-[24px] -right-7 z-40">
							<button
								onClick={toggleMute}
								className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2"
							>
							{isMuted ? (
								<HiMiniSpeakerWave className="text-red-600" />
							) : (
								<HiMiniSpeakerWave />
							)}
							</button>
						</div>
					</>
				)}
					<div className="relative w-full h-full flex items-center justify-center">
						
						<SharedSsupViewer
							sharedSsupData={postItem}
							onClose={() => {
}}
							scale={0.6} // Adjusted to maintain aspect ratio
						/>
					</div>
				</div>
			</div>
		)
	}

	const renderSnipItem = () => {
		const post = postItem;
		const interactiveVideo = JSON.parse(post.interactiveVideo)[0];

		return (
			<div
				className="absolute z-10 cursor-pointer"
				onClick={handleRedirection}
				style={{
					left: `${calculatedLeft}px - 10px`,
					top: `${calculatedTop}px`
				}}
			>
				<SnippageSnup
					postShare={postItem}
					isTimerPaused={isTimerPaused}
					isMuted={isMuted}
					toggleMute={toggleMute}
				/>
			</div>
		);
	};

	return (
		<div
			ref={parentRef}
			className="w-full h-full flex items-center justify-center"
		>	
			{(postItem.isForInteractiveVideo || postItem.audioFile) && (
					<div className="absolute top-24 right-2 z-50">
						<button
							onClick={toggleMute}
							className="text-text-color bg-secondary-bg-color opacity-70 rounded-full h-max w-max p-2"
						>
							{isMuted ? (
								<HiMiniSpeakerWave className="text-red-600" />
							) : (
								<HiMiniSpeakerWave />
							)}
						</button>
					</div>
				)}
			<div
				className="relative overflow-hidden w-full"
				style={{
					height: `${postContainerHeight}px`,
				}}
			>
				
				{postShare.ssupItem ? renderSsupItem() : renderSnipItem()}
				{/* <Image
					onContextMenu={(e) => e.preventDefault()}
					src={postShare.ssupItem ? postItem.coverFile : postItem.coverFile}
					width={1000}
					height={1000}
					alt="Story of non center user"
					className="w-full h-full object-contain rounded-lg bg-bg-color blur-sm opacity-75"
				/> */}
			</div>
		</div>
	)
}

export default PostInStory