import { useEffect } from 'react';
import uselocalStorage from './useLocalStorage';

const useColorMode = () => {
    const [colorMode, setColorMode] = uselocalStorage('color-theme', 'light');

    useEffect(() => {
        const className = 'dark';
        const bodyClass = document.body.classList;

        colorMode === 'dark'
            ? bodyClass.add(className)
            : bodyClass.remove(className);
    }, [colorMode]);

    return [colorMode, setColorMode];
};

export default useColorMode;
