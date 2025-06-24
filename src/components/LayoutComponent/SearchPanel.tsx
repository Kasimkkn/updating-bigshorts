import SearchModal from "@/components/modal/SearchModal";

type SearchPanelProps = {
    onClose: () => void;
    toggleSearch: () => void;
    toggleSideBar: () => void;
};

const SearchPanel = ({ onClose, toggleSearch, toggleSideBar }: SearchPanelProps) => {
    return <SearchModal onClose={onClose} toggleSearch={toggleSearch} toggleSidebar={toggleSideBar}/>;
};

export default SearchPanel;