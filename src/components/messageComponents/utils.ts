
export const processStoryData = (rawData: string) => {
    if (rawData?.includes('_USERINFO_')) {
        const [storyInfo, userInfo] = rawData.split('_USERINFO_');

        const storyData = JSON.parse(storyInfo);
        const userData = JSON.parse(userInfo);

        const transformedData = [
            {
                stories: [storyData],
                isFriend: 0,
                isMuted: userData.isMuted,
                isVerified: userData.isVerified,
                userEmail: userData.userEmail,
                userFullName: userData.userFullName,
                userId: userData.userId,
                userMobileNo: userData.userMobileNo,
                userName: userData.userName,
                userProfileImage: userData.userProfileImage
            }
        ];
        return transformedData;
    } else {
        return rawData;
    }

};
export const sanitizeFileName = (fileName: string): string => {
    try {
      // Remove non-ASCII characters and keep only alphanumeric with few safe characters
      let sanitized = fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric (except dots and hyphens) with underscore
        .replace(/[^\x00-\x7F]/g, '') // Remove all non-ASCII characters
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .trim()
        .toLowerCase();
  
      // Handle empty filename after sanitization
      if (!sanitized || sanitized === '.') {
        return `file_${Date.now()}`;
      }
  
      // Handle extension
      const lastDotIndex = sanitized.lastIndexOf('.');
      if (lastDotIndex === -1) {
        // No extension found
        return sanitized.substring(0, Math.min(sanitized.length, 40));
      }
  
      const name = sanitized.substring(0, lastDotIndex);
      const extension = sanitized.substring(lastDotIndex + 1);
  
      // If name is empty but has extension
      if (!name) {
        return `file_${Date.now()}.${extension}`;
      }
  
      // Limit name to 40 characters plus extension
      const truncatedName = name.substring(0, Math.min(name.length, 40));
      return `${truncatedName}.${extension}`;
    } catch (e) {
      console.error('Error sanitizing filename:', e);
      return `file_${Date.now()}`;
    }
  };