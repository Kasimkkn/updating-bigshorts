interface Stories {
    postId: number;
    postTitle: string;
    languageId: number;
    coverFile: string;
    isAllowComment: number;
    isPosted: number;
    scheduleTime: string;
    isInteractive: string;
    interactiveVideo: string;
    isForInteractiveImage: number;
    isForInteractiveVideo: number;
    audioId: number;
    audioName: string;
    audioDuration: string;
    audioOwnerName: string;
    audioCoverImage: string;
    audioFile: string;
    viewCounts: number;
    isRead: number;
    storyEndTime: string;
    taggedUser: any[];
    ssupreaction?: string;
}
interface StoryData {
    userId: number;
    userProfileImage: string;
    userFullName: string;
    userName: string;
    userMobileNo: string;
    userEmail: string;
    isVerified: number;
    isMuted: number;
    stories: Stories[];
    isFriend: number;
}


type StoryInsightsData = {
    accountReached: number,
    accountEngaged: number,
    profileActivity: number,
    totalReach: number,
    followerReach: number,
    nonFollowerReach: number,
    totalReplies: number,
    totalReaction: number,
    totalShare: number,
    profileVisits: number,
    profileFollows: number
}

export const emojiList = [
    // Smileys & Emotion
    '❤️', '👍', '😭', '😂', '🙏🏻',
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😊', '😋',
    '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😜', '😝', '😛', '🤑',
    '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
    '🙄', '😬', '😕', '😟', '🧐', '🤓', '😳', '🥵', '🥶', '😨', '😰',
    '😥', '😓', '😖', '😣', '😢', '😭', '😠', '😡', '🤬', '🤯', '😱',
    '🥺', '😤', '😧', '😮', '😯', '😲', '😳', '🥱', '😴', '🤤', '😪',
    '😵', '🤐', '🥴', '🤒', '🤕', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
    '🤞', '🤟', '🤲', '🤝', '✊', '👊', '👍', '👎', '✋', '🖐', '🖖',
    // Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
    '🐣', '🐥', '🦆', '🦅', '🦉', '🦜', '🐓', '🐣', '🐤', '🐥', '🐦',
    '🦃', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
    '🕷', '🕸', '🐢', '🐍', '🦎', '🦂', '🦖', '🦕', '🐙', '🦑', '🦐',
    '🦞', '🦀', '🐬', '🐳', '🐋', '🦖', '🐠', '🐟', '🐡', '🦈', '🐚',
    '🐳', '🐬', '🐟', '🐠', '🐞', '🕷', '🕸',
    // Food & Drink
    '🍎', '🍐', '🍌', '🍋', '🍓', '🫐', '🍇', '🍈', '🍒', '🍑', '🍍',
    '🥭', '🍠', '🍯', '🥥', '🥦', '🥒', '🌽', '🥕', '🍠', '🥔', '🥯',
    '🥖', '🥐', '🍞', '🥨', '🍕', '🌮', '🌯', '🥙', '🍗', '🍖', '🍔',
    '🍟', '🍕', '🌮', '🌯', '🍿', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃',
    '🍸', '🍹', '🍶', '🍵', '☕', '🥜', '🌰', '🫒', '🍅', '🥞', '🧀',
    '🥓', '🥩', '🍳', '🌶', '🧅', '🥚', '🥫', '🍲', '🍜', '🍝', '🥣',
    '🍣', '🍤', '🦞', '🍦', '🍨', '🍧', '🥧', '🍰', '🧁', '🍮', '🍭',
    '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🍼', '🥛', '☕',
    // Objects
    '⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗣',
    '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🎥', '📷', '📸', '📹', '🎥', '📽',
    '🎞', '📞', '☎️', '📟', '📠', '🧭', '🗺', '🗿', '🪧', '⚓', '⛵',
    '🚢', '🚤', '🛳', '⛴', '🛥', '🚢', '🚗', '🚕', '🚌', '🚎', '🏎',
    '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏎️', '🚲', '🛵', '🏍',
    '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚃', '🚋', '🚝',
    '🚄', '🚅', '🚈', '🚞', '🚂', '🚆', '🚇', '🚊', '🚉', '✈', '🛫',
    '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🌠', '🤖', '🎃', '🎄', '🎂',
    '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧮', '📿',
    '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '🏧', '🚮', '🚰',
    '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🛅', '🚸'
];

export type { Stories, StoryData, StoryInsightsData }