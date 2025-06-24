import { PostlistItem } from "@/models/postlistResponse";

export const getTimeDifference = (timeSchedule: string): string => {
  const postDate = new Date(timeSchedule);
  const now = new Date();

  if (isNaN(postDate.getTime()) || isNaN(now.getTime())) {
    return "Invalid date";
  }

  let diffInMs: number = now.getTime() - postDate.getTime();

  if (diffInMs < 0) {
    diffInMs = 0;
  }

  const diffInSeconds: number = Math.floor(diffInMs / 1000);
  const diffInMinutes: number = Math.floor(diffInSeconds / 60);
  const diffInHours: number = Math.floor(diffInMinutes / 60);

  // const diffInDays: number = Math.floor(diffInHours / 24);

  // if (diffInSeconds < 60) {
  //   return `${diffInSeconds}s ago`;
  // } else if (diffInMinutes < 60) {
  //   return `${diffInMinutes}m ago`;
  // } else if (diffInHours < 24) {
  //   return `${diffInHours}h ago`;

  const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffInDays = Math.floor((nowDateOnly.getTime() - postDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  const hours = postDate.getHours();
  const minutes = postDate.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 2) {
    return `${diffInHours}h ago`;
  }
  else if (diffInDays === 0) {
    return `Today at ${formattedHours}:${formattedMinutes} ${ampm}`;
  } else if (diffInDays === 1) {
    return `Yesterday at ${formattedHours}:${formattedMinutes} ${ampm}`;
  } else {
    return `${diffInDays}d ago`;
  }
};

export function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // If the date is in the future
  if (date.getTime() > now.getTime()) {
    // Format: Scheduled for 15 June 2025 01:14 PM
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    return `Scheduled for ${day} ${month} ${year} ${formattedTime}`;
  }

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? 'year' : 'years'} ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? 'month' : 'months'} ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? 'day' : 'days'} ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? 'hour' : 'hours'} ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? 'minute' : 'minutes'} ago`;
  }
  return `${Math.floor(seconds)} ${seconds === 1 ? 'second' : 'seconds'} ago`;
}


export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours || 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};

export const getDateHeader = (dateStr: string) => {
  const today = new Date();
  const messageDate = new Date(dateStr);
  const diffDays = Math.floor(
    (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  }
};

export function groupNotification(notification: string): string {
  const now = new Date();
  const notificationDate = new Date(notification);
  let groupKey: string;

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  if (isSameDay(notificationDate, now)) {
    groupKey = 'Today';
  } else if (isSameDay(notificationDate, new Date(now.getTime() - 24 * 60 * 60 * 1000))) {
    groupKey = 'Yesterday';
  } else if (
    notificationDate.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000 &&
    notificationDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000
  ) {
    groupKey = 'This Week';
  } else if (
    notificationDate.getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000 &&
    notificationDate.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000
  ) {
    groupKey = 'This Month';
  } else {
    groupKey = 'Older';
  }

  return groupKey;
}

export function parseRelativeDate(dateTimeString: string): string {
  const dateTime = new Date(dateTimeString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const differenceInMs = now.getTime() - dateTime.getTime();
  const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const differenceInDays = Math.floor(differenceInHours / 24);

  if (
    dateTime.getFullYear() === now.getFullYear() &&
    dateTime.getMonth() === now.getMonth() &&
    dateTime.getDate() === now.getDate()
  ) {
    if (differenceInMinutes < 1) {
      return "Just now";
    } else if (differenceInMinutes < 60) {
      return `${differenceInMinutes} minute${differenceInMinutes === 1 ? '' : 's'} ago`;
    } else {
      return `${dateTime.getHours()}:${String(dateTime.getMinutes()).padStart(2, '0')}`;
    }
  } else if (
    dateTime.getFullYear() === yesterday.getFullYear() &&
    dateTime.getMonth() === yesterday.getMonth() &&
    dateTime.getDate() === yesterday.getDate()
  ) {
    return `Yesterday at ${dateTime.getHours()}:${String(dateTime.getMinutes()).padStart(2, '0')}`;
  } else if (differenceInDays < 7) {
    return `${differenceInDays + 1} day${differenceInDays === 1 ? '' : 's'} ago`;
  } else if (differenceInDays >= 7 && differenceInDays < 30) {
    return `${padDay(dateTime.getDate())} ${getMonthName(dateTime.getMonth())}`;
  } else if (differenceInDays >= 30 && differenceInDays < 365) {
    return `${padDay(dateTime.getDate())} ${getMonthName(dateTime.getMonth())}`;
  } else {
    const yearsAgo = Math.floor(differenceInDays / 365);
    return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`;
  }
}

function padDay(day: number): string {
  return String(day).padStart(2, '0');
}

function getMonthName(monthIndex: number): string {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames[monthIndex];
}

export function generateUniqueId() {
  let uniqueId = '';
  for (let i = 0; i < 10; i++) {
    uniqueId += Math.floor(Math.random() * 10);
  }
  return parseInt(uniqueId);
}

export function convertStringToColor(color: string | undefined): string {
  if (!color || color.trim() === "") {
    return "transparent"; // Fallback
  }

  try {
    color = color.trim();

    // Handle the original format: "Color(0x...)"
    if (color.startsWith("Color(") && color.endsWith(")")) {
      const valueString = color.substring(6, color.length - 1); // Between '(' and ')'
      const value = parseInt(valueString, 16);
      return intToRgba(value);
    }

    // Handle the new format: "#..." or "0x..."
    if (color.startsWith("#")) {
      let value = parseInt(color.substring(1), 16);
      if (color.length === 7) {
        // Add alpha channel if missing (default to 0xFF)
        value |= 0xFF000000;
      }
      return intToRgba(value);
    } else if (color.startsWith("0x")) {
      const value = parseInt(color.substring(2), 16);
      return intToRgba(value);
    }
  } catch (e) {
    // console.error(`Error converting color string: ${color} - ${e}`);
  }

  return "transparent";
}

// Helper: Convert 0xAARRGGBB to rgba() string
function intToRgba(value: number): string {
  const a = ((value >> 24) & 0xFF) / 255;
  const r = (value >> 16) & 0xFF;
  const g = (value >> 8) & 0xFF;
  const b = value & 0xFF;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}



export function convertColorToString(color: string) {
  return color.startsWith("#") ? `0xff${color.slice(1).toUpperCase()}` : `0xff${color.toUpperCase()}`;
}

export function svgToDataURL(svg: string) {
  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
}

export const actionIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%230000FF'/%3E%3Cline x1='50' y1='20' x2='50' y2='80' stroke='%23FFFFFF' stroke-width='10'/%3E%3Cline x1='20' y1='50' x2='80' y2='50' stroke='%23FFFFFF' stroke-width='10'/%3E%3C/svg%3E";
export const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
export const cloneIcon = "data:image/svg+xml,%3Csvg viewBox='-6 -6 36.00 36.00' fill='none' xmlns='http://www.w3.org/2000/svg' stroke='%23000000' stroke-width='0.00024000000000000003'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3Crect x='-6' y='-6' width='36.00' height='36.00' rx='18' fill='%237eec91' strokewidth='0'%3E%3C/rect%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M19.53 8L14 2.47C13.8595 2.32931 13.6688 2.25018 13.47 2.25H11C10.2707 2.25 9.57118 2.53973 9.05546 3.05546C8.53973 3.57118 8.25 4.27065 8.25 5V6.25H7C6.27065 6.25 5.57118 6.53973 5.05546 7.05546C4.53973 7.57118 4.25 8.27065 4.25 9V19C4.25 19.7293 4.53973 20.4288 5.05546 20.9445C5.57118 21.4603 6.27065 21.75 7 21.75H14C14.7293 21.75 15.4288 21.4603 15.9445 20.9445C16.4603 20.4288 16.75 19.7293 16.75 19V17.75H17C17.7293 17.75 18.4288 17.4603 18.9445 16.9445C19.4603 16.4288 19.75 15.7293 19.75 15V8.5C19.7421 8.3116 19.6636 8.13309 19.53 8ZM14.25 4.81L17.19 7.75H14.25V4.81ZM15.25 19C15.25 19.3315 15.1183 19.6495 14.8839 19.8839C14.6495 20.1183 14.3315 20.25 14 20.25H7C6.66848 20.25 6.35054 20.1183 6.11612 19.8839C5.8817 19.6495 5.75 19.3315 5.75 19V9C5.75 8.66848 5.8817 8.35054 6.11612 8.11612C6.35054 7.8817 6.66848 7.75 7 7.75H8.25V15C8.25 15.7293 8.53973 16.4288 9.05546 16.9445C9.57118 17.4603 10.2707 17.75 11 17.75H15.25V19ZM17 16.25H11C10.6685 16.25 10.3505 16.1183 10.1161 15.8839C9.8817 15.6495 9.75 15.3315 9.75 15V5C9.75 4.66848 9.8817 4.35054 10.1161 4.11612C10.3505 3.8817 10.6685 3.75 11 3.75H12.75V8.5C12.7526 8.69811 12.8324 8.88737 12.9725 9.02747C13.1126 9.16756 13.3019 9.24741 13.5 9.25H18.25V15C18.25 15.3315 18.1183 15.6495 17.8839 15.8839C17.6495 16.1183 17.3315 16.25 17 16.25Z' fill='%23000000'%3E%3C/path%3E%3C/g%3E%3C/svg%3E";
export const editIcon = "data:image/svg+xml,%3Csvg fill='%23ede8e8' version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='165px' height='165px' viewBox='-227.67 -227.67 950.28 950.28' xml:space='preserve' stroke='%23ede8e8' stroke-width='0.00494936'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0' transform='translate(0,0), scale(1)'%3E%3Crect x='-227.67' y='-227.67' width='950.28' height='950.28' rx='475.14' fill='%23430070' strokewidth='0'%3E%3C/rect%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cg%3E%3Cg%3E%3Cpath d='M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157 c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21 s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741 c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z'%3E%3C/path%3E%3Cpath d='M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069 c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963 c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692 C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107 l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005 c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E";


export const calculateDateDifference = (selectedDate: Date | string): string => {
  let parsedDate: Date;

  if (typeof selectedDate === 'string') {
    parsedDate = new Date(selectedDate);
  } else {
    parsedDate = selectedDate;
  }

  const now = new Date();
  const currentTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0,
    0
  );

  const selectedTime = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    parsedDate.getHours(),
    parsedDate.getMinutes(),
    0,  // Setting seconds to 0
    0   // Setting milliseconds to 0
  );

  let formattedDifference = '0 days 0 hours 0 minutes';

  if (selectedTime > currentTime) {
    // Calculate the difference in milliseconds and convert to minutes
    const difference = selectedTime.getTime() - currentTime.getTime();
    const differenceInMinutes = Math.floor(difference / 60000);

    const days = Math.floor(differenceInMinutes / (60 * 24));
    const hours = Math.floor((differenceInMinutes % (60 * 24)) / 60);
    const minutes = differenceInMinutes % 60;

    // Format the result
    formattedDifference = `${days} days ${hours} hours ${minutes} minutes`;
  }

  return formattedDifference;
};

export const getInitials = (name: string) => {
  if (!name) return "";
  if (name.length === 1) return name.toUpperCase();
  // if name dont have aany ojter word than too
  if (name.split(" ").length === 1) return name[0].toUpperCase();
  return name.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const formatVideoRuntime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};


export const safelyParseJSON = (jsonString: string | undefined | null) => {
  if (!jsonString) return null;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

// Step 5: Use the utility function in Posts.tsx to check for interactive elements
// This function will be used when rendering VideoPlayerWidget components
export const determineInteractiveElements = (post: PostlistItem) => {
  if (!post.interactiveVideo) return false;

  const videos = safelyParseJSON(post.interactiveVideo.toString());

  if (!videos || !Array.isArray(videos)) return false;

  return videos.some(video =>
    video?.finalJsondetails !== undefined &&
    video?.finalJsondetails !== null
  );
};

export async function getBlobDuration(blob: Blob) {
  const tempVideoEl = document.createElement('video')

  const durationP = new Promise<number>((resolve, reject) => {
    tempVideoEl.addEventListener('loadedmetadata', () => {
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (tempVideoEl.duration === Infinity) {
        tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER
        tempVideoEl.ontimeupdate = () => {
          tempVideoEl.ontimeupdate = null
          resolve(tempVideoEl.duration)
          tempVideoEl.currentTime = 0
        }
      }
      // Normal behavior
      else
        resolve(tempVideoEl.duration)
    })
    tempVideoEl.onerror = () => {
      const error = (tempVideoEl.error as MediaError)?.message || 'Unknown error';
      reject(new Error(error));
    };
  })

  tempVideoEl.src = typeof blob === 'string'
    ? blob
    : window.URL.createObjectURL(blob)

  return durationP
}


export function extractAndReplaceUserName(audioName: string, newUsername: string): string {
  const regex = /(\w+)'s (Original Audio|original audio)/;
  const match = regex.exec(audioName);
  if (match) {
    const fullMatch = match[0] || '';
    const secondGroup = match[2];
    return audioName.replace(fullMatch, `${newUsername}'s ${secondGroup}`);
  }

  return audioName;
}
export function getAudioNameForSubtitle(audioNameFromJSON: string | null | undefined, feedItemUsername: string): string {
  if (audioNameFromJSON && audioNameFromJSON.trim() !== '') {
    return extractAndReplaceUserName(audioNameFromJSON, feedItemUsername);
  } else {
    return 'Music';
  }
}
