import React, { useEffect, useState } from 'react';
import { getVideosToLink } from '@/services/linkoldsnip';
import Image from 'next/image';
import SafeImage from './SafeImage';

interface Snip {
  id: string;
  title?: string;
  coverfilename?: string;
}

interface SelectSnipModalProps {
  onClose: () => void;
  onSelect: (snipId: string) => void;
}

const SelectSnipModal: React.FC<SelectSnipModalProps> = ({ onClose, onSelect }) => {
  const [selectedSnipId, setSelectedSnipId] = useState<string | null>(null);
  const [snips, setSnips] = useState<Snip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnips = async () => {
      try {
        setLoading(true);
        const response = await getVideosToLink();

        const transformedSnips: Snip[] = response.data.data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          coverfilename: item.coverfilename,
        }));

        setSnips(transformedSnips);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching snips:', err);
        setError('Failed to fetch snips.');
        setLoading(false);
      }
    };

    fetchSnips();
  }, []);

  const handleSnipSelect = (snipId: string) => {
    setSelectedSnipId(snipId);
  };

  const handleLinkSelected = () => {
    if (selectedSnipId) {
      onSelect(selectedSnipId);
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
          <h1 className="text-xl text-primary-text-color font-semibold">Select a Snip</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Snip List - Displaying titles and coverfilename */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-primary-text-color">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && snips.length === 0 && (
            <p className="text-primary-text-color">No snips available.</p>
          )}
          {!loading && !error && snips.map((snip) => (
            <div
              key={snip.id}
              className={`flex items-center bg-zinc-800 rounded-lg p-4 cursor-pointer ${selectedSnipId === snip.id ? 'ring-2 ring-purple-500' : ''
                }`}
              onClick={() => handleSnipSelect(snip.id)}
            >
              <div className="flex items-center flex-1">
                {snip.coverfilename && (
                  <div className="w-16 h-16 mr-3 relative">
                   <SafeImage
                      src={snip.coverfilename}
                      alt=""
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="text-primary-text-color text-lg">
                  {snip.title || ''}
                </span>
              </div>
              <div className="ml-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 ${selectedSnipId === snip.id
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
            className={`w-full py-4 rounded-full text-primary-text-color text-center font-bold cursor-pointer ${selectedSnipId
              ? 'bg-gradient-to-r from-blue-400 to-purple-500'
              : 'bg-secondary-bg-color'
              }`}
            onClick={handleLinkSelected}
          >
            Link Selected Snip
          </div>
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default SelectSnipModal;