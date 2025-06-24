import { checkusernameexist } from "@/services/auth/checkusernameexist";
import { getusernamesuggestion } from "@/services/auth/getusernamesuggestion";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ModerSpinner } from "@/components/LoadingSpinner";
interface UsernameStepProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const usernameValidator = (username = '') => {
  if (/[A-Z]/.test(username)) {
    return "\u26A0 Uppercase letters are not allowed";
  }
  if (/\s/.test(username)) {
    return "\u26A0 Spaces are not allowed";
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "\u26A0 Only letters, numbers, and underscores are allowed";
  }
  if (!/^[a-z]/.test(username)) {
    return "\u26A0 The first character must be a letter";
  }
  return null;
};

const UsernameStep: React.FC<UsernameStepProps> = ({ username, setUsername }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputBorderColor, setInputBorderColor] = useState<string>('border-border-color');
  const [inputIcon, setInputIcon] = useState<React.ReactNode>(null);
  const [isSuggestionClicked, setIsSuggestionClicked] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (username.trim() === '' || isSuggestionClicked) {
        setSuggestions([]);
        setError('');
        setInputBorderColor('border-border-color');
        setInputIcon(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const timer = setTimeout(async () => {
        const validationError = usernameValidator(username);
        if (validationError) {
          setError(validationError);
          setSuggestions([]);
          setInputBorderColor('border-red-500');
          setInputIcon(<IoClose className="absolute text-sm right-2 top-1/2 transform -translate-y-1/2 text-red-500" />);
        } else {
          const usernameExist = await checkusernameexist({ userName: username });
          // Check if isSuccess is true instead of data === "Success"
          if (usernameExist.isSuccess) {
            // Username is available
            setError('');
            setInputBorderColor('border-green-500');
            setInputIcon(<FaCheck className="absolute text-sm right-2 top-1/2 transform -translate-y-1/2 text-green-500" />);
            // Don't show suggestions when username is available
            setSuggestions([]);
          } else {
            // Username is not available
            setError("\u26A0 Username already taken");
            setInputBorderColor('border-red-500');
            setInputIcon(<IoClose className="absolute text-sm right-2 top-1/2 transform -translate-y-1/2 text-red-500" />);
            // Get username suggestions when username is taken
            if (!isSuggestionClicked) {
              const response = await getusernamesuggestion({ userName: username });
              setSuggestions(response.data || []);
            }
          }
        }
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    };

    fetchSuggestions();
  }, [username, isSuggestionClicked]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsSuggestionClicked(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setSuggestions([]);
    setIsSuggestionClicked(true);
    setError('');
    setInputBorderColor('border-green-500');
    setInputIcon(<FaCheck className="absolute text-sm right-2 top-1/2 transform -translate-y-1/2 text-green-500" />);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).classList.contains('suggestion-item')) {
        setSuggestions([]);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClickOutside);
      }
    };
  }, []);

  return (
    <div className='flex flex-col gap-1'>
      <h2 className="text-lg font-bold text-text-color">Choose Username</h2>
      <h5 className='text-sm text-text-color font-normal '>Enter Your Username</h5>
      <h5 className='text-sm text-text-color font-normal mb-2'>Don&#39;t Worry You Can Always Change It Later!</h5>
      <div className="relative w-full mt-1">
        <input
          type="text"
          className={`linearInput text-text-color w-full px-4 py-2 border rounded-md focus:outline-none ${inputBorderColor}`}
          placeholder="Enter your username"
          value={username}
          aria-label='username'
          required
          onChange={handleUsernameChange}
        />
        {isLoading && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 "><ModerSpinner /></div>}
        {inputIcon}
        {suggestions.length > 0 && !isLoading && (
          <div className="absolute z-10 w-full bg-bg-color border rounded-md ">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-secondary-bg-color cursor-pointer text-text-color suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default UsernameStep;