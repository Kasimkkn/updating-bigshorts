import { LoadingSpinner } from '@/components/LoadingSpinner';
import React, { useEffect, useRef, useState } from 'react'
import Input from '../Input';
import Image from 'next/image';
import { FaHashtag, FaRegCommentAlt } from 'react-icons/fa';
import Button from '../Button';
import { FollowingModalData } from '@/types/usersTypes';
import { HashtagList, hashtagSearch } from '@/services/hashtagsearch';
import Avatar from '@/components/Avatar/Avatar';
import { getFollowerList } from '@/services/userfriendlist';
import { BiImageAdd, BiPencil } from 'react-icons/bi';
import ThumbnailPicker from './ThumbnailPicker';
import { FaClock } from 'react-icons/fa6';
import { Genre, GenreListResponse, getGenreList } from '@/services/genrelist';
import useLocalStorage from '@/hooks/useLocalStorage';
import SafeImage from '../SafeImage';

interface FlixDetailsProps {
	onSubmit: () => void;
	finalSubmitLoading: boolean;
	coverFileImage: string;
	setFlixInformation: React.Dispatch<React.SetStateAction<{
		title: string,
		scheduleDateTime: string,
		hashArray: string[],
		friendArray: string[],
		isAllowComment: 0 | 1,
		description: string,
		genreId: number
	}>>;
	setCoverFileImage: React.Dispatch<React.SetStateAction<string>>;
	videoUrl: string
	initialValues?: {
		title: string,
		scheduleDateTime?: string,
		hashArray?: string[],
		friendArray?: string[],
		isAllowComment: number,
		description: string,
		genreId?: number
	};
}

const FlixDetails = ({ onSubmit, coverFileImage, finalSubmitLoading, setFlixInformation, setCoverFileImage, videoUrl, initialValues }: FlixDetailsProps) => {
	const [description, setDescription] = useState<string>(initialValues?.description || '');
	const descriptionRef = useRef<HTMLTextAreaElement>(null); //needed to shift focus back to textarea after clicking on suggestion
	const [title, setTitle] = useState<string>(initialValues?.title || '');
	const [hashtags, setHashtags] = useState<Set<string>>(new Set());
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [isScheduleSet, setIsScheduleSet] = useState<boolean>(false);
	const [friendArray, setFriendArray] = useState<string[]>([]);
	const [isDatepickerOpen, setIsDatepickerOpen] = useState<boolean>(false);
	const [descriptionSuggestions, setDescriptionSuggestions] = useState<HashtagList[] | FollowingModalData[]>([]);
	const [descriptionSuggestionsFilter, setDescriptionSuggestionsFilter] = useState<string | null>(null);
	const [descriptionSuggestionsLoading, setDescriptionSuggestionsLoading] = useState<boolean>(false);
	const [isAllowComment, setIsAllowComment] = useState<boolean>(true);
	const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState<boolean>(false);
	const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
	const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
	const [isGenresLoading, setIsGenresLoading] = useState(false);
	const [genres, setGenres] = useState<Genre[]>([]);
	const videoRef = useRef<HTMLVideoElement | null>(null);


	const [id] = useLocalStorage<string>('userId', '');
  	const userId = id ? parseInt(id) : 0;
	const currentDateTime = `${new Date().toLocaleDateString('en-CA')}T${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

	const loadGenres = async () => {
		setIsGenresLoading(true);
		try {
			const fetchedGenres = await getGenreList();
			if (fetchedGenres.isSuccess) {
				setGenres(fetchedGenres.data);  // Use fetchedGenres.data to set the genres
			} else {
				console.error('Genre fetch was not successful:', fetchedGenres.message);
				setGenres([]);
			}
		} catch (error) {
			console.error('Failed to load genres', error);
			setGenres([]);
		} finally {
			setIsGenresLoading(false);
		}
	};

	// Trigger genre loading when modal opens
	useEffect(() => {
		if (isGenreModalOpen) {
			loadGenres();
		}
	}, [isGenreModalOpen]);

	useEffect(() => {
		const video = videoRef.current;

		if (video) {
			const handleThumbnailCapture = () => {
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				const context = canvas.getContext("2d");

				if (context) {
					context.drawImage(video, 0, 0, canvas.width, canvas.height);
					const dataURL = canvas.toDataURL("image/png");
					setCoverFileImage(dataURL);
				}
			};

			// Create a one-time seeked event handler
			const handleSeeked = () => {
				handleThumbnailCapture();
				video.removeEventListener("seeked", handleSeeked);
			};

			// Listen for the seeked event
			video.addEventListener("seeked", handleSeeked);

			// Wait for video to be ready before seeking
			const handleLoadedData = () => {
				// Set current time to 1 second (or less if the video is shorter)
				const targetTime = Math.min(1, video.duration);
				video.currentTime = targetTime;

				// If the video is already at the target time (or very close)
				// we might not get a seeked event, so capture now
				if (Math.abs(video.currentTime - targetTime) < 0.1) {
					handleThumbnailCapture();
					video.removeEventListener("seeked", handleSeeked);
				}
			};

			video.addEventListener("loadeddata", handleLoadedData);

			// Clean up all event listeners on unmount
			return () => {
				video.removeEventListener("loadeddata", handleLoadedData);
				video.removeEventListener("seeked", handleSeeked);
			};
		}
	}, [videoUrl]);


	useEffect(() => {
		setFlixInformation((prev) => ({
			...prev,
			usersSelectedate: new Date(),
		}));
	}, []);

	useEffect(() => {
		if (description.length > 0) {
			const extractedHashtags = description.match(/#[\w]+/g) || [];
			const updatedHashtags = new Set(extractedHashtags);

			const extractedFriends = description.match(/@[\w]+/g) || [];
			const updatedFriends = new Set(extractedFriends);

			setHashtags(updatedHashtags);
			setFriendArray(Array.from(updatedFriends));
		} else {
			setHashtags(new Set());
			setFriendArray([]);
			setDescriptionSuggestions([])
		}
		setFlixInformation((prev) => ({
			...prev,
			description: description,
		}));
	}, [description]);

	useEffect(() => {
		setFlixInformation((prev) => ({
			...prev,
			title: title,
		}));
	}, [title]);

	// Remove the previous useEffect for genres
	useEffect(() => {
		if (selectedGenre) {
			setFlixInformation((prev) => ({
				...prev,
				genreId: selectedGenre.id
			}));
		}
	}, [selectedGenre]);

	useEffect(() => {
		setFlixInformation((prev) => ({
			...prev,
			hashArray: Array.from(hashtags),
			friendArray: Array.from(friendArray),
		}));
	}, [hashtags, friendArray])

	useEffect(() => {
		const newVal = isAllowComment ? 1 : 0
		setFlixInformation((prev) => ({
			...prev,
			isAllowComment: newVal
		}));
	}, [isAllowComment])

	useEffect(() => {
		setFlixInformation((prev) => ({
			...prev,
			hashArray: Array.from(hashtags),
			friendArray: Array.from(friendArray),
		}));
	}, [hashtags, friendArray])

	const handleScheduleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = event.target.value;
		const usersSelectedate = new Date(inputValue.replace("T", " ") + ":00");
		if (isNaN(usersSelectedate.getTime())) {
			console.error("Invalid date parsed from input value:", inputValue);
			return;
		}

		const difference = calculateDateDifference(usersSelectedate);
		const formattedDifference = formatDateDifference(difference);
		setSelectedDate(formattedDifference);
		setFlixInformation((prev) => ({
			...prev,
			scheduleDateTime: formattedDifference,
			usersSelectedate: usersSelectedate,
		}));

		setIsScheduleSet(true);
		setIsDatepickerOpen(false);
	};

	const calculateDateDifference = (selectedDate: Date) => {
		const now = new Date();
		const diffInMilliseconds = selectedDate.getTime() - now.getTime();

		const diffInSeconds = Math.max(diffInMilliseconds / 1000, 0);
		const days = Math.floor(diffInSeconds / (3600 * 24));
		const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((diffInSeconds % 3600) / 60);

		return { days, hours, minutes };
	};


	const formatDateDifference = (difference: { days: number, hours: number, minutes: number }) => {
		return `${difference.days} days ${difference.hours} hours ${difference.minutes} minutes`;
	};

	const handleDateClick = () => {
		setIsDatepickerOpen(true);
	};

	const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value;
		setDescription(value);
		const matchTaggedUsers = RegExp(/@\w*$/).exec(value)
		const matchHashtags = RegExp(/#\w*$/).exec(value)

		if (matchTaggedUsers) {
			setDescriptionSuggestionsFilter(matchTaggedUsers[0])
		} else if (matchHashtags) {
			setDescriptionSuggestionsFilter(matchHashtags[0])
		} else {
			setDescriptionSuggestionsFilter(null)
		}
	};

	const handleTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value;
		setTitle(value);
	};



	const handleSubmit = () => {
		onSubmit();
		setSelectedDate(null);
	};

	const renderDescriptionSuggestions = () => {
		const suggestionType = descriptionSuggestionsFilter ? descriptionSuggestionsFilter.charAt(0) : "";
		const handleSuggestionClick = (text: string) => {
			if (descriptionSuggestionsFilter === null) {
				return
			}
			const newDescription = description.replace(new RegExp(`${descriptionSuggestionsFilter}(?!.*${descriptionSuggestionsFilter})`), text);
			setDescription(newDescription);
			setDescriptionSuggestions([]);
			setDescriptionSuggestionsFilter(null);

			setTimeout(() => {
				descriptionRef.current?.focus();
				if (descriptionRef.current) {
					descriptionRef.current.setSelectionRange(newDescription.length + 1, newDescription.length + 1);
				}
			}, 0);
		}
		return (
			<div className="flex flex-col gap-2 overflow-y-auto h-48 absolute -bottom-[7rem] w-full p-2 bg-bg-color/10 backdrop-blur-sm rounded-md z-20">
				{descriptionSuggestionsLoading ? <LoadingSpinner />
					:
					descriptionSuggestions.map((item: any, index: number) => {
						return (
							<div
								key={index}
								className='bg-primary-bg-color rounded-md hover:bg-bg-color flex p-2 items-center gap-2 cursor-pointer'
								onClick={(e) => handleSuggestionClick(suggestionType === "#" ? item.name : suggestionType === "@" ? `@${item.friendUserName}` : '')}
							>
								{suggestionType === '#' ? (
									<p className="text-text-color truncate">{item?.name}</p>
								) : suggestionType === '@' && (
									<>
										<Avatar
											src={item.userProfileImage}
											name={item.friendName}
											width="w-7"
											height="h-7" isMoreBorder={false}
										/>
										<p className="text-text-color truncate">{item.friendUserName}</p>
									</>
								)}
							</div>
						)
					})
				}
			</div>
		)
	}

	const searchHashtags = async (query: string) => {
		setDescriptionSuggestionsLoading(true);
		const response = await hashtagSearch({ text: query });
		const list = Array.isArray(response.data) ? response.data : [];
		setDescriptionSuggestions(list);
		setDescriptionSuggestionsLoading(false);
	}

	const searchTaggedUsers = async (query: string) => {
		setDescriptionSuggestionsLoading(true);
		let data = {
			friendName: query,
			userId: Number(userId),
			isCreatePost: 0,
			page: 1,
			pageSize: 20,
			username: query ? query : null,
		};
		const response = await getFollowerList(data);
		const list = Array.isArray(response.data) ? response.data : [];
		setDescriptionSuggestions(list);
		setDescriptionSuggestionsLoading(false);
	}

	useEffect(() => {
		if (descriptionSuggestionsFilter !== null) {
			const type = descriptionSuggestionsFilter.charAt(0);
			const query = descriptionSuggestionsFilter.substring(1);
			if (type === '#' && query) {
				searchHashtags(query)
			} else if (type === '@') {
				searchTaggedUsers(query)
			}
		} else {
			setDescriptionSuggestions([])
		}
	}, [descriptionSuggestionsFilter]);

	const highlightHashtags = (text: string) => {
		const escaped = text
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\n$/g, "\n")

		return escaped
			.replace(/#\w+/g, (tag) => `<span class="text-text-color">${tag}</span>`)
			.replace(/@\w+/g, (tag) => `<span class="text-text-color">${tag}</span>`);
	}

	return (
		<div className="flex-1 overflow-y-auto w-full h-full">
			{finalSubmitLoading ? (
				<div className="flex justify-center items-center h-full">
					<div className="flex flex-col items-center space-y-4">
						<LoadingSpinner />
						<p className="text-text-color animate-pulse">Creating your Mini...</p>
					</div>
				</div>
			) : (
				<div className="h-full flex flex-col w-full p-2 sm:p-4 md:p-6">
					{/* Top Section - Thumbnail and Video Preview */}
					<div className="flex flex-col gap-4 mb-4 sm:mb-6">
						{/* Video and Thumbnail Preview */}
						<div className="w-full flex flex-col lg:grid lg:grid-cols-3 gap-4 mb-2 items-end">
							<div className="lg:col-span-2 aspect-[16/9] w-full max-h-48 sm:max-h-60 md:max-h-none md:h-60 rounded-lg overflow-hidden relative outline outline-2 outline-gray-400 outline-offset-2">
								<video
									ref={videoRef}
									src={videoUrl}
									className="w-full h-full object-contain"
									autoPlay
									muted
									loop
								/>
							</div>

							{/* Thumbnail and Genre Container */}
							<div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-3">
								{/* Thumbnail Container */}
								<div className="flex-1 lg:flex-initial">
									<label className="text-xs sm:text-sm text-text-color font-medium flex items-center gap-2 mb-2">
										<BiImageAdd className="text-text-color" />
										Thumbnail
									</label>
									<div
										className="aspect-video rounded-lg overflow-hidden relative border-2 border-dashed border-border-color/30 hover:border-border-color/70 cursor-pointer"
										onClick={() => setIsThumbnailPickerOpen(true)}
									>
										<div className="w-full h-full flex flex-col items-center justify-center">
											<div className="absolute inset-0">
												<SafeImage
													src={coverFileImage}
													alt="Thumbnail"
													className="w-full h-full object-contain"
													width={300}
													height={200}
												/>
											</div>
											<div className="absolute inset-0 bg-bg-color/0 hover:bg-bg-color/50 hover:cursor-pointer transition-all rounded-md opacity-0 hover:opacity-100 flex flex-col items-center justify-center z-10">
												<BiImageAdd size={30} className="sm:w-12 sm:h-12 text-primary-text-color mb-2" />
												<p className="text-primary-text-color text-xs sm:text-sm font-medium text-center px-2">Choose Thumbnail</p>
											</div>
										</div>
									</div>
								</div>

								{/* Genres Selection */}
								<div className="flex-1 lg:flex-initial">
									<label className="text-xs sm:text-sm text-text-color font-medium flex items-center gap-2 mb-2">
										<FaHashtag className="text-text-color" />
										Genre
									</label>
									<div
										className="w-full p-2 sm:p-3 border border-border-color/50 rounded-lg bg-primary-bg-color focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-text-color transition-all duration-200 cursor-pointer text-sm"
										onClick={() => setIsGenreModalOpen(true)}
									>
										{selectedGenre ? selectedGenre.name : 'Select Genre'}
									</div>
								</div>
							</div>
						</div>

						{/* Genre Selection Modal */}
						{isGenreModalOpen && (
							<div className="fixed inset-0 bg-bg-color/50 flex items-center justify-center z-50 p-4">
								<div className="bg-secondary-bg-color rounded-lg w-full max-w-sm sm:max-w-md max-h-[70vh] overflow-hidden">
									<div className="flex justify-between items-center px-4 sm:px-6 py-4">
										<h2 className="text-lg sm:text-xl font-semibold text-text-color">Select Genre</h2>
										<button
											onClick={() => setIsGenreModalOpen(false)}
											className="text-text-color hover:text-red-500 p-1"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x sm:w-6 sm:h-6">
												<line x1="18" y1="6" x2="6" y2="18"></line>
												<line x1="6" y1="6" x2="18" y2="18"></line>
											</svg>
										</button>
									</div>
									<div
										className="px-4 sm:px-6 pb-6 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-rounded-full scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-600 scrollbar-track-gray-200"
										style={{
											maxHeight: "calc(70vh - 80px)",
											scrollbarWidth: "thin", /* Firefox */
											scrollbarColor: "#718096 #E2E8F0" /* Firefox */
										}}
									>
										<div className="space-y-2">
											{genres.map((genre) => (
												<div
													key={genre.id}
													className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${selectedGenre?.name === genre.name
														? 'bg-blue-500/20 text-text-color'
														: 'hover:bg-primary-bg-color text-text-color'
														}`}
													onClick={() => {
														setSelectedGenre(genre);
														setIsGenreModalOpen(false);
													}}
												>
													{genre.name}
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Bottom Section - All Details */}
					<div className="flex-1 bg-primary-bg-color">
						{/* Title */}
						<div className="flex flex-col gap-2 mb-4 sm:mb-5">
							<label className="text-xs sm:text-sm text-text-color font-medium flex items-center gap-2">
								<BiPencil className="text-text-color" />
								Title
							</label>
							<div className="relative w-full">
								<textarea
									value={title}
									className="w-full p-2 sm:p-3 border border-border-color/50 rounded-lg bg-primary-bg-color focus:outline-none focus:ring-2 focus:ring-border-color focus:border-border-color resize-none text-text-color transition-all duration-200 text-sm sm:text-base lg:text-lg"
									placeholder="Enter title"
									spellCheck="false"
									onChange={handleTitleChange}
									rows={1}
								/>
							</div>
						</div>

						{/* Two Column Layout for Description and Settings */}
						<div className="flex flex-col xl:grid xl:grid-cols-3 gap-4 sm:gap-5 pb-5">
							{/* Description - Takes up 2/3 on large screens */}
							<div className="xl:col-span-2 flex flex-col gap-2">
								<label className="text-xs sm:text-sm text-text-color font-medium flex items-center gap-2">
									<FaHashtag className="text-text-color" />
									Description
								</label>
								<div className="relative w-full">
									<textarea
										ref={descriptionRef}
										value={description}
										className="w-full p-2 sm:p-3 h-24 sm:h-32 text-transparent caret-text-color bg-primary-bg-color border border-border-color/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-border-color focus:border-border-color resize-none text-sm sm:text-base"
										placeholder="Enter description"
										spellCheck="false"
										onChange={handleDescriptionChange}
										rows={4}
									/>
									<div
										className="absolute top-0 left-0 w-full h-full p-2 sm:p-3 whitespace-pre-wrap break-words text-text-color pointer-events-none text-sm sm:text-base"
										dangerouslySetInnerHTML={{ __html: highlightHashtags(description) || '<span class="text-text-color"></span>' }}
									/>
									{descriptionSuggestions.length > 0 && renderDescriptionSuggestions()}
								</div>

								{/* Hashtag Preview */}
								{Array.from(hashtags).length > 0 && (
									<div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
										{Array.from(hashtags).map((tag, index) => (
											<span key={index} className="bg-bg-color text-text-color px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
												{tag}
											</span>
										))}
									</div>
								)}
							</div>

							{/* Settings Column - Takes up 1/3 on large screens */}
							<div className="flex flex-col gap-3 sm:gap-4">
								{/* Schedule date */}
								<div className="flex flex-col gap-2">
									<label className="text-xs sm:text-sm text-text-color font-medium flex items-center gap-2">
										<FaClock className="text-text-color" />
										Schedule
									</label>
									<div className="flex items-center bg-primary-bg-color border border-border-color rounded-lg p-2 transition-all hover:border-border-color">
										{isScheduleSet && !isDatepickerOpen ? (
											<div className="flex justify-between items-center w-full">
												<span className="text-xs sm:text-sm text-text-color truncate mr-2">
													{selectedDate}
												</span>
												<Button
													isLinearBorder={true}
													onClick={handleDateClick}

												>
													Change
												</Button>
											</div>
										) : (
											<Input
												type="datetime-local"
												onChange={handleScheduleDateChange}
												min={currentDateTime}
												placeholder="Set publishing time"
												defaultValue={currentDateTime}
											/>
										)}
									</div>
								</div>

								{/* isAllowComment Toggle */}
								<div className="flex items-center justify-between p-2 sm:p-3 bg-primary-bg-color border border-border-color/50 rounded-lg text-text-color transition-all hover:border-border-color">
									<div className='flex items-center gap-2 sm:gap-3'>
										<FaRegCommentAlt className="text-text-color text-sm sm:text-base" />
										<p className='font-medium text-xs sm:text-sm'>Allow Comments</p>
									</div>
									<div className="flex items-center">
										<button
											onClick={() => setIsAllowComment(!isAllowComment)}
											className={`w-10 h-5 sm:w-12 sm:h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isAllowComment ? 'bg-bg-color' : 'bg-secondary-bg-color'}`}
										>
											<div
												className={`bg-primary-bg-color w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform transition-transform duration-300 ${isAllowComment ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}
											/>
										</button>
									</div>
								</div>

								{/* Submit Button */}
								<Button
									isLinearBtn={true}
									onClick={handleSubmit}
									className="py-2 sm:py-3 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 mt-auto"
								>
									Publish Mini
								</Button>
							</div>
						</div>
					</div>

					{/* Thumbnail Picker Modal */}
					{isThumbnailPickerOpen &&
						<ThumbnailPicker
							setThumbnail={setCoverFileImage}
							onClose={() => setIsThumbnailPickerOpen(false)}
							videoUrl={videoUrl}
							isFor='flix'
							defaultThumbnail= {coverFileImage || undefined}
						/>
					}
				</div>
			)}
		</div>
	);
}

export default FlixDetails;