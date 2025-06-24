export const usernameValidator = (username : string) => {
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

export const emailValidator = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "\u26A0 Please enter a valid email address";
    }
    return null;
};

export const phoneNumberValidator = (phone: string) => {
    if (!/^\d{10}$/.test(phone)) {
        return "\u26A0 Please enter a valid phone number";
    }
    return null;
};