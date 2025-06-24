import CommonModalLayer from '@/components/modal/CommonModalLayer';
import { CurrentLocationSkeleton, LocationPickerSkeleton } from '@/components/Skeletons/Skeletons';
import { getCurrentAddress } from '@/services/getcurrentaddress';
import { getNearbyPlaces, NearbyPlace } from '@/services/getNearbyPlaces';
import { Place, searchPlaces } from '@/services/searchplaces';
import React, { useEffect, useState } from 'react';
import { FaLocationDot } from 'react-icons/fa6';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearch } from 'react-icons/io5';
import Input from '../Input';

interface LocationPickerProps {
    onClose: () => void;
    setLocation: React.Dispatch<React.SetStateAction<string>>;
}
const LocationPicker = ({ onClose, setLocation, }: LocationPickerProps) => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMyLocationLoading, setIsMyLocationLoading] = useState(false);
    const [userCoords, setUserCoords] = useState<GeolocationPosition | null>(null);
    const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
    const [myLocation, setMyLocation] = useState<string>('');
    const [searchedPlaces, setSearchedPlaces] = useState<Place[]>([]);

    const handleLocationClick = (name: string) => {
        setLocation(name);
        onClose();
    }

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserCoords(position),
                (error) => console.error('Error getting location:', error)
            );
        }
    };

    useEffect(() => {
        const fetchMyLocation = async (longitude: string, latitude: string) => {
            try {
                setIsMyLocationLoading(true);
                let data = {
                    latitude: latitude,
                    longitude: longitude
                };
                const response = await getCurrentAddress(data);
                const address = response.data.address;
                setMyLocation(address);
            } catch (e) {
            } finally {
                setIsMyLocationLoading(false);
            }
        };

        if (userCoords) {
            fetchMyLocation(userCoords.coords.longitude.toString(), userCoords.coords.latitude.toString());
        }
    }, [userCoords])

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        const fetchNearbyPlaces = async (longitude: string, latitude: string) => {

            setLoading(true);
            try {
                let data = {
                    latitude: latitude,
                    longitude: longitude
                };
                const response = await getNearbyPlaces(data);
                const list = await response.data;
                setNearbyPlaces(list);
            } catch (error) {
                console.error('Error fetching nearby places:', error);
            } finally {
                setLoading(false);
            }
        };
        if (userCoords) {
            fetchNearbyPlaces(userCoords.coords.longitude.toString(), userCoords.coords.latitude.toString());
        }
    }, [userCoords]);

    useEffect(() => {
        const fetchSearchedPlaces = async (query: string) => {
            try {
                setLoading(true);
                let data = {
                    query: query
                };
                const response = await searchPlaces(data);
                const list = response.data;
                setSearchedPlaces(list);
            } catch (e) {
            } finally {
                setLoading(false);
            }
        };

        if (search.length > 0) {
            fetchSearchedPlaces(search);
        } else {
            setSearchedPlaces([]);
        }
    }, [search])

    return (
        <CommonModalLayer width='max-w-md' height='h-max' onClose={onClose}>
            <div className='w-full h-[50vh] flex flex-col'>

                <div className="flex items-center justify-between m-4">
                    <h2 className="text-xl font-semibold">Nearby Places</h2>
                    <button
                        onClick={getCurrentLocation}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                    >
                        <IoMdRefresh className="text-text-color" size={20} />
                    </button>
                </div>

                <div className="relative mb-4 mx-1">
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        placeholder="Search places..."
                        className="w-full p-2 pl-10"
                    />
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-color" />
                </div>


                <div className="flex flex-col min-w-0 w-full bg-secondary-bg-color p-2 mb-4 border-border-color border-y">
                    <p className="text-text-color font-semibold truncate">Your Location</p>
                    {isMyLocationLoading ? (
                        <CurrentLocationSkeleton />
                    )
                        :
                        <p className="text-text-color text-sm line-clamp-2">{myLocation}</p>}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <LocationPickerSkeleton />
                    ) : (
                        <div className="space-y-2">
                            {searchedPlaces.length > 0 ? (
                                searchedPlaces.map((place, i) => (
                                    <div
                                        key={i}
                                        className="w-full flex items-center gap-4 py-2 px-4 cursor-pointer bg-bg-color hover:bg-bg-color-70"
                                        onClick={() => handleLocationClick(place.name)}
                                    >
                                        <FaLocationDot className='flex-shrink-0' size={25} />
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-text-color font-semibold truncate">{place.name}</p>
                                            <p className="text-text-color text-sm line-clamp-3">{place.address}</p>
                                        </div>
                                    </div>
                                ))
                            )
                                : (
                                    nearbyPlaces.map((place, i) => (
                                        <div
                                            key={i}
                                            className="w-full flex items-center gap-4 py-2 px-4  cursor-pointer bg-bg-color hover:bg-bg-color-70"
                                            onClick={() => handleLocationClick(place.name)}
                                        >
                                            <FaLocationDot className='flex-shrink-0' size={25} />
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-text-color font-semibold truncate">{place.name}</p>
                                                <p className="text-text-color text-sm line-clamp-3">{place.address}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            {nearbyPlaces.map((place, i) => (
                                <div
                                    key={i}
                                    className="w-full flex items-center gap-4 py-2 px-4 rounded-md cursor-pointer bg-bg-color hover:bg-bg-color-70"
                                    onClick={() => handleLocationClick(place.name)}
                                >
                                    <FaLocationDot className='flex-shrink-0' size={25} />
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-text-color font-semibold truncate">{place.name}</p>
                                        <p className="text-text-color text-sm line-clamp-3">{place.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CommonModalLayer>
    )
}

export default LocationPicker