import { SeriesDetailsSkeleton } from '@/components/Skeletons/Skeletons';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';
import { deleteSeasons } from '@/services/deleteseason';
import { deleteSeries } from '@/services/deleteseries';
import { getSeasonDetails, SeasonData } from '@/services/getseasondetails';
import { Series } from '@/services/getserieslist';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi'; // Added three dots icon
import { FaPlay } from 'react-icons/fa';
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5';
import CreateSeasonModal from '../CreateSeason/createseason';
import EditSeasonModal from '../EditSeason/editseason';
import CommonModalLayer from '../modal/CommonModalLayer';
import ConfirmModal from '../modal/ConfirmModal';
import Button from '../shared/Button';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileAppModal from '../modal/MobileAppModal';
import SafeImage from '../shared/SafeImage';


interface SeriesDetailsProps {
	series: Series;
	onClose: () => void;
	isFromProfile?: boolean;
	updateUpstream?: () => void;
}

const SeriesDetails = ({ onClose, series, isFromProfile, updateUpstream }: SeriesDetailsProps) => {
	const [isSeasonDropdown, setIsSeasonDropdown] = useState(false);
	const [currentSeason, setCurrentSeason] = useState<number>(0);
	const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [seeMore, setSeeMore] = useState<number | null>(null);
	const [showOptionsMenu, setShowOptionsMenu] = useState(false); // State for series options menu
	const [showSeasonOptionsMenu, setShowSeasonOptionsMenu] = useState(false); // State for season options menu
	const [showEditSeasonModal, setShowEditSeasonModal] = useState(false); // State for edit season modal
	const [deleting, setDeleting] = useState(false); //loading state for delete series
	const [showSeriesDeleteConfirmation, setShowSeriesDeleteConfirmation] = useState(false);
	const [showSeasonDeleteConfirmation, setShowSeasonDeleteConfirmation] = useState(false);
	const [showAddSeasonModal, setShowAddSeasonModal] = useState(false);
	const optionsMenuRef = useRef<HTMLDivElement>(null); // Ref for series options menu
	const seasonOptionsMenuRef = useRef<HTMLDivElement>(null); // Ref for season options menu
	const seasonDropdownRef = useRef<HTMLDivElement>(null); //ref for season list dropdown
	const router = useRouter();
	const { setInAppFlixData } = useInAppRedirection();
	const [showMobileModal, setShowMobileModal] = useState(false);
	const [selectedContentType, setSelectedContentType] = useState<string>('');
	const { isMobile, deviceType } = useMobileDetection();
	const toggleSeasonDropdown = () => {
		setIsSeasonDropdown(!isSeasonDropdown);
	}

	const toggleSeasonOptionsMenu = () => {
		setShowSeasonOptionsMenu(!showSeasonOptionsMenu);
	}

	const toggleOptionsMenu = () => {
		setShowOptionsMenu(!showOptionsMenu);
	}

	// Handle edit season
	const handleEditSeason = () => {
		if (isMobile) {
			setSelectedContentType('Season');
			setShowMobileModal(true);
		} else {
			setShowSeasonOptionsMenu(false);
			setShowEditSeasonModal(true);

		}
	}

	// Handle save season changes
	const handleSaveSeasonChanges = () => {
		// Here you would call your API to update the season
		// After successful update, you could refresh the season data
		fetchSeasonDetails();
		updateUpstream && updateUpstream();
	}
	const handleAddMoreSeasons = () => {
		if (isMobile) {
			setSelectedContentType('Season');
			setShowMobileModal(true);
		} else {
			setShowAddSeasonModal(true);
			setShowOptionsMenu(false);
		}
	}
	// Handle delete season
	const handleDeleteSeason = async () => {
		if (!seasonData) return;
		setDeleting(true);
		try {
			// Call the API to delete the season
			const response = await deleteSeasons({
				seasonIds: [series.seasons[currentSeason].id],
				deleteflix: false // Set to true if you want to delete associated flix entries as well
			});
			if (response.isSuccess) {
				// Close the modal after successful deletion or refresh data
				updateUpstream && updateUpstream();
				onClose();
				// Alternatively, you could refresh the series data and stay on the page
				// router.push('/home');
			} else {
				console.error("Failed to delete season:", response.message);
				// You can implement error handling here (e.g., show an error message)
			}
		} catch (error) {
			console.error("Error deleting season:", error);
			// You can implement error handling here (e.g., show an error message)
		} finally {
			setDeleting(false);
			setShowSeasonDeleteConfirmation(false);
		}
		setShowSeasonOptionsMenu(false);
	}

	// Handle delete series option
	const handleDeleteSeries = async () => {
		setDeleting(true);
		try {
			// Call the API to delete the series
			const response = await deleteSeries({ series_id: series.id });
			if (response.isSuccess) {
				// Close the modal after successful deletion
				updateUpstream && updateUpstream();
				onClose();
				// Optionally, you can redirect to another page or refresh the series list
				// router.push('/home');
			} else {
				console.error("Failed to delete series:", response.message);
				// You can implement error handling here (e.g., show an error message)
			}
		} catch (error) {
			console.error("Error deleting series:", error);
			// You can implement error handling here (e.g., show an error message)
		} finally {
			setDeleting(false);
			setShowSeriesDeleteConfirmation(false);
		}
		setShowOptionsMenu(false);
	}

	// Close the options menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
				setShowOptionsMenu(false);
			}
			if (seasonOptionsMenuRef.current && !seasonOptionsMenuRef.current.contains(event.target as Node)) {
				setShowSeasonOptionsMenu(false);
			}
			if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
				setIsSeasonDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const fetchSeasonDetails = async () => {
		setIsLoading(true);
		try {
			const response = await getSeasonDetails({ series_id: series.id, season_id: series.seasons[currentSeason].id });
			if (response.isSuccess && response.data) {
				setSeasonData(response.data);
			} else {
				console.error("Failed to fetch series list");
			}
		} catch (error) {
			console.error("Failed to fetch season details:", error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchSeasonDetails();
	}, [currentSeason])

	const handleShowMore = (id: number) => {
		if (id === seeMore) {
			setSeeMore(null);
		} else {
			setSeeMore(id)
		}
	}

	const handleEpisodeClick = (episode: any) => {
		if (seasonData) {
			const episodeData = {
				...episode,
				isOriginal: true,
				seasonId: seasonData.season.id,
				seriesId: series.id,
				postId: episode.flixid,
				postTitle: episode.title,
				coverFile: episode.thumbnail
			};
			setInAppFlixData(episodeData);
			setTimeout(() => {
				router.push(`/home/series/${episodeData.flixid}/${series.id}/${seasonData.season.id}`);
				onClose();
			}, 300); // Small delay to ensure state is set
		}
	};

	const handlePlayLatest = () => {
		if (seasonData && seasonData.episodes.length > 0) {
			handleEpisodeClick(seasonData.episodes[seasonData.episodes.length - 1]);
		}
	}

	if (isLoading) {
		return (
			<CommonModalLayer
				width='w-full max-w-5xl'
				height='h-max'
				onClose={onClose}
			>
				<SeriesDetailsSkeleton />
			</CommonModalLayer>
		)
	}

	const handleMobileModalClose = () => {
		setShowMobileModal(false);
		setSelectedContentType('');
	};
	if (showMobileModal) {
		return (
			<MobileAppModal
				onClose={handleMobileModalClose}
				deviceType={deviceType}
				contentType={selectedContentType}
			/>
		);
	}

	return (
		<>
			<CommonModalLayer
				width='w-full max-w-5xl'
				height='h-max'
				onClose={onClose}
			>
				{seasonData &&
					(<div className='w-full flex flex-col bg-bg-color h-[90vh] overflow-y-auto'>
						{/* Series cover file at the top */}
						<div className='relative text-text-color flex flex-col'>
							{/* Three dots menu at top right */}
							{isFromProfile && (
								<div className="absolute top-4 right-4 z-20">
									<div className="relative" ref={optionsMenuRef}>
										<button
											className="p-2 rounded-full bg-bg-color-70 hover:bg-primary-bg-color text-text-color"
											onClick={toggleOptionsMenu}
										>
											<BiDotsVerticalRounded size={24} />
										</button>
										{showOptionsMenu && (
											<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-primary-bg-color z-30">
												<div className="py-1">
													<button
														className="block w-full text-left px-4 py-2 text-text-color hover:bg-bg-color-70"
														onClick={handleAddMoreSeasons}
													>
														Add More Seasons
													</button>
													<button
														className="block w-full text-left px-4 py-2 text-red-500 hover:bg-bg-color-70"
														onClick={() => setShowSeriesDeleteConfirmation(true)}
													>
														Delete Series
													</button>
												</div>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Series cover file */}
							<div className="relative h-[30vh] md:h-[40vh] w-full">
								<div className="absolute inset-0">
									<SafeImage
										src={series.coverfile}
										alt={series.series_name}
										className="w-full h-full object-cover object-top"
									/>

									{/* Series Title */}
									<div className="absolute flex flex-col justify-end bottom-0 left-0 right-0 bg-gradient-to-t from-bg-color text-text-color to-transparent p-4 h-1/2">
										<h1 className="text-4xl md:text-5xl font-bold">{series.series_name}</h1>
										<p className="text-sm font-semibold">{series.scheduledAt && <span className="text-md font-light">{series.scheduledAt.substring(0, 4)}</span>}   {series.seasons.length} Seasons</p>
									</div>
									{/* <div className="absolute inset-0 bg-gradient-to-t from-bg-color to-transparent" /> */}
									{/* <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg-color to-transparent" /> */}
								</div>
							</div>

							{/* Season cover file in row format */}
							<div className="px-4 pb-2">
								<div className="flex items-center gap-4">
									<div className="relative w-1/3 md:w-1/4 aspect-video rounded-md overflow-hidden">
										<SafeImage
											src={seasonData.season.poster_image}
											alt={`Season ${currentSeason + 1}`}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex-1">
										<h2 className="text-2xl font-bold mb-2">{seasonData.season.title}</h2>
										<p className="text-sm md:text-base">{seasonData.season.description || 'No description available'}</p>
									</div>
								</div>
							</div>

							{/* Season controls */}
							<div className="px-4 py-4 flex items-center justify-between w-full">
								<div className="flex items-center gap-4">
									<Button isLinearBorder={true} isLinearBtn={true} onClick={handlePlayLatest}>
										<FaPlay />
										<p className="font-semibold">Play Latest</p>
									</Button>
									<div className="relative text-text-color">
										<Button isLinearBorder={true} onClick={toggleSeasonDropdown}>
											<p className="font-semibold">Season {currentSeason + 1}</p>
											<IoChevronDownSharp />
										</Button>

										{isSeasonDropdown &&
											<div className="absolute right-0 mt-1 w-full rounded-md shadow-lg bg-primary-bg-color z-30 p-1" ref={seasonDropdownRef}>
												{series.seasons.map((_, index) => (
													<div
														key={index}
														className="hover:bg-bg-color-70 cursor-pointer w-full rounded-md p-2"
														onClick={() => { setCurrentSeason(index); toggleSeasonDropdown() }}
													>
														<p>Season {index + 1}</p>
													</div>
												))}
											</div>}
									</div>
								</div>

								{/* Additional three dots in the button row with season options */}
								{isFromProfile && (
									<div className="relative" ref={seasonOptionsMenuRef}>
										<button
											className="p-2 rounded-full bg-bg-color-70 hover:bg-primary-bg-color text-text-color"
											onClick={toggleSeasonOptionsMenu}
										>
											<BiDotsVerticalRounded size={24} />
										</button>
										{showSeasonOptionsMenu && (
											<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-primary-bg-color z-30">
												<div className="py-1">
													<button
														className="block w-full text-left px-4 py-2 text-text-color hover:bg-bg-color-70"
														onClick={handleEditSeason}
													>
														Edit Season
													</button>
													<button
														className="block w-full text-left px-4 py-2 text-red-500 hover:bg-bg-color-70"
														onClick={() => setShowSeasonDeleteConfirmation(true)}
													>
														Delete Season
													</button>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="w-full p-4">
							{seasonData.episodes.length ? (
								<>
									<div className='flex justify-between items-center mb-4'>
										<h2 className="text-2xl font-bold">Episodes</h2>
										<p>{seasonData.episodes.length} Episodes</p>
									</div>

									<div className='w-full max-h-[50vh] overflow-y-auto'>
										{seasonData.episodes.map((episode, index) => (
											<div key={index} className="flex items-center gap-4 rounded-md hover:bg-primary-bg-color p-2">
												<div
													className="relative w-1/3 rounded-md overflow-hidden flex-shrink-0 aspect-video cursor-pointer"
													onClick={() => handleEpisodeClick(episode)}
												>
													<SafeImage
														src={episode.thumbnail}
														alt={episode.title}
														className="w-full h-full object-cover"
													/>
												</div>
												<div className="w-2/3 min-w-0" onClick={() => handleShowMore(episode.id)}>
													<h3 className="text-xl font-semibold truncate">{index + 1}. {episode.title}</h3>
													<p className={`text-sm ${seeMore !== episode.id && "line-clamp-1 xl:line-clamp-2"}`}>{episode.description}</p>
													{seeMore === episode.id ?
														<div className='flex'>
															<p>Show less</p>
															<IoChevronUpSharp />
														</div>
														:
														<div className='flex items-center gap-1'>
															<p>Show more</p>
															<IoChevronDownSharp />
														</div>
													}
												</div>
											</div>
										))}
									</div>
								</>
							)
								: (
									<div>
										No episode found
									</div>
								)}

							{/* <h2 className="text-2xl font-bold mb-4">Cast</h2> */}

							<div className='w-full overflow-x-auto flex gap-2'>
								{/* {cast.map((actor: any, index: any) => {
									// return (
									// 	// <div className='w-1/3 min-w-[200px] bg-primary-bg-color p-2' key={index}>
									// 	// 	<div className='w-full aspect-square bg-bg-color flex items-center justify-center rounded-md'>
									// 	// 		image
									// 	// 	</div>
									// 	// 	<p>{actor.name}</p>
									// 	// 	<p>{actor.role}</p>
									// 	// </div>
									// )
								})} */}
							</div>
						</div>
					</div>)}
				{showSeriesDeleteConfirmation && (
					<ConfirmModal
						onConfirm={handleDeleteSeries}
						onCancel={() => setShowSeriesDeleteConfirmation(false)}
						isOpen={showSeriesDeleteConfirmation}
						isPerformingAction={deleting}
						message={`Are you sure you want to delete the series "${series.series_name}"?`}
					/>
				)}
				{showSeasonDeleteConfirmation && (
					<ConfirmModal
						onConfirm={handleDeleteSeason}
						onCancel={() => setShowSeasonDeleteConfirmation(false)}
						isOpen={showSeasonDeleteConfirmation}
						isPerformingAction={deleting}
						message={`Are you sure you want to delete the season "${seasonData?.season.title}"?`}
					/>
				)}
			</CommonModalLayer>

			{/* Edit Season Modal */}
			{showEditSeasonModal && seasonData && (
				<EditSeasonModal
					onClose={() => setShowEditSeasonModal(false)}
					onSaveChanges={handleSaveSeasonChanges}
					currentSeasonData={{
						id: seasonData.season.id,
						season_name: seasonData.season.title || seasonData.season.title || '',
						description: seasonData.season.description || '',
						coverfile: seasonData.season.poster_image || '',
					}}
					seriesName={series.series_name}
					existingFlixIds={seasonData.episodes.map(episode => episode.flixid)}
					seriesData={{  // Add this section
						id: series.id,
						series_name: series.series_name,
						series_description: series.description,
						series_coverfile: series.coverfile,
						series_scheduledAt: series.scheduledAt || "",
					}}
				/>
			)}
			{/* Add Season Modal */}
			{showAddSeasonModal && (
				<CreateSeasonModal
					onBack={() => setShowAddSeasonModal(false)}
					onClose={onClose}
					onCreateSeason={handleSaveSeasonChanges}
					seriesData={{
						id: series.id,
						series_name: series.series_name,
						series_description: series.description,
						series_coverfile: series.coverfile,
						series_scheduledAt: series.scheduledAt || "",

					}}
				/>
			)}
		</>
	)
}

export default SeriesDetails