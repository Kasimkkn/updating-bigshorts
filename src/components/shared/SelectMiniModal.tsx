import React, { useEffect, useState } from 'react';
import { getMinisToLink } from '@/services/linkoldmini';
import Image from 'next/image';
import SafeImage from './SafeImage';

interface Mini {
  id: string;
  title?: string;
  coverfilename?: string;
}

interface SelectMiniModalProps {
  onClose: () => void;
  onSelect: (miniId: string) => void;
}

const SelectMiniModal: React.FC<SelectMiniModalProps> = ({ onClose, onSelect }) => {
  const [selectedMiniId, setSelectedMiniId] = useState<string | null>(null);
  const [minis, setMinis] = useState<Mini[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinis = async () => {
      try {
        setLoading(true);
        const response = await getMinisToLink();

        const transformedMinis: Mini[] = response.data.data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          coverfilename: item.coverfilename,
        }));

        setMinis(transformedMinis);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching minis:', err);
        setError('Failed to fetch minis.');
        setLoading(false);
      }
    };

    fetchMinis();
  }, []);

  const handleMiniSelect = (miniId: string) => {
    setSelectedMiniId(miniId);
  };

  const handleLinkSelected = () => {
    if (selectedMiniId) {
      onSelect(selectedMiniId);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-color bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md mx-auto overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={onClose} className="text-primary-text-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl text-primary-text-color font-semibold">Select a Mini</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Mini List - Displaying titles and coverfilename */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-primary-text-color">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && minis.length === 0 && (
            <p className="text-primary-text-color">No minis available.</p>
          )}
          {!loading && !error && minis.map((mini) => (
            <div
              key={mini.id}
              className={`flex items-center bg-zinc-800 rounded-lg p-4 cursor-pointer ${selectedMiniId === mini.id ? 'ring-2 ring-purple-500' : ''
                }`}
              onClick={() => handleMiniSelect(mini.id)}
            >
              <div className="flex items-center flex-1">
                {mini.coverfilename && (
                  <div className="w-16 h-16 mr-3">
                    <SafeImage
                      src={mini.coverfilename}
                      alt=""
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="text-primary-text-color text-lg">
                  {mini.title || ''}
                </span>
              </div>
              <div className="ml-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 ${selectedMiniId === mini.id
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-white'
                    }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4">
          <div
            className={`w-full py-4 rounded-full text-primary-text-color text-center font-bold cursor-pointer ${selectedMiniId
              ? 'bg-gradient-to-r from-blue-400 to-purple-500'
              : 'bg-secondary-bg-color'
              }`}
            onClick={handleLinkSelected}
          >
            Link Selected Mini
          </div>
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default SelectMiniModal;