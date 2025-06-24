import React, { useState } from 'react';
import Button from './Button';
import CommonModalLayer from '../modal/CommonModalLayer';
import Input from './Input';

interface LinkAddModalProps {
    initialLinkLabel?: string;
    initialLinkHref?: string;
    onSave: (linkLabel: string, linkHref: string) => void; // Add this to props interface
    onClose: () => void;
}

const LinkAddModal: React.FC<LinkAddModalProps> = ({
    initialLinkLabel = '',
    initialLinkHref = '',
    onSave,
    onClose,
}) => {
    const [linkLabel, setLinkLabel] = useState(initialLinkLabel);
    const [linkHref, setLinkHref] = useState(initialLinkHref);

    const icons = [
        { name: 'Facebook', label: 'Facebook', icon: '🔵', link: 'https://facebook.com' },
        { name: 'Instagram', label: 'Instagram', icon: '🟣', link: 'https://instagram.com' },
        { name: 'Twitter', label: 'Twitter', icon: '🔷', link: 'https://twitter.com' },
        { name: 'YouTube', label: 'YouTube', icon: '🔴', link: 'https://youtube.com' },
        { name: 'Flipkart', label: 'Flipkart', icon: '🟡', link: 'https://flipkart.com' },
        { name: 'Amazon', label: 'Amazon', icon: '🟠', link: 'https://amazon.com' },
        { name: 'Meesho', label: 'Meesho', icon: '🟢', link: 'https://meesho.com' },
    ];

    const handleIconClick = (label: string, link: string) => {
        setLinkLabel(label);
        setLinkHref(link);
    };
    return (
        <CommonModalLayer
            width='w-max'
            height='h-max'
        >
            <div className="p-3 w-96 shadow-md mx-auto">
                <h2 className="text-lg font-semibold mb-4 text-text-color">Enter link details</h2>

                <div className="mb-4">
                    <label htmlFor="linkUrl" className="block text-sm font-medium text-text-color">
                        Link URL
                    </label>
                    <Input
                        type="text"
                        id="linkUrl"
                        value={linkHref}
                        onChange={(e) => setLinkHref(e.target.value)}
                        placeholder="Enter URL"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="linkLabel" className="block text-sm font-medium text-text-color">
                        Link Text
                    </label>
                    <Input
                        type="text"
                        id="linkLabel"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        placeholder="Enter text to display"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-color mb-2">Select an icon:</label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                        {icons.map((icon) => (
                            <button
                                key={icon.name}
                                onClick={() => handleIconClick(icon.label, icon.link)}
                                className="p-1 rounded-full bg-secondary-bg-color hover:bg-secondary-bg-color focus:outline-none"
                            >
                                <span className="text-2xl">{icon.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        isLinearBorder={true}
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Button
                        isLinearBtn={true}
                        onClick={() => {
                            onSave(linkLabel, linkHref)
                            setLinkHref('');
                            setLinkLabel('');
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default LinkAddModal;
