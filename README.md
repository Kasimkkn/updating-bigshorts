# Bigshorts Social Media Web

# 📁 Detailed Folder Structure

## Root Directory
```
social-media-platform/
├── 📁 ffmpeg/                           # Video processing binaries
│   ├── ffmpeg                           # FFmpeg executable
│   └── ffmpeg-mac                       # macOS FFmpeg executable
├── 📁 public/                           # Static assets served directly
│   ├── 📁 img/                          # UI icons and graphics
│   │   ├── Ic_Cloud.png
│   │   ├── Ic_Juggedbox.png
│   │   ├── Ic_Paintbrush.png
│   │   ├── Ic_Sharedgebox.png
│   │   ├── Ic_Sharpbox.png
│   │   ├── Ic_boxwithcircle.png
│   │   └── Ic_fadedbox.png
│   └── favicon.svg                      # Site favicon
└── 📁 src/                              # Source code directory
```

## Source Code Structure (`/src`)

### 🚪 App Router (`/src/app`)
```
📁 app/                                  # Next.js 13+ App Router
├── 📁 api/                              # API Routes
│   ├── 📁 process-video/               # Video processing endpoint
│   ├── 📁 trim-video/                  # Video trimming endpoint
│   └── 📁 upload/                      # File upload endpoint
├── 📁 auth/                            # Authentication pages
│   ├── 📁 change-known-password/
│   ├── 📁 change-password/
│   ├── 📁 forgot-password/
│   ├── 📁 login/
│   ├── 📁 registration/
│   ├── 📁 sign-up/
│   └── layout.tsx                      # Auth layout wrapper
├── 📁 home/                            # Main application pages
│   ├── 📁 Flixfeed/                    # Video feed page
│   ├── 📁 about-us/
│   ├── 📁 flix/                        # Video content pages
│   │   ├── 📁 [id]/                    # Individual video page
│   │   └── 📁 series/[...id]/          # Video series pages
│   ├── 📁 followers/                   # Followers management
│   ├── 📁 message/                     # Messaging interface
│   ├── 📁 playlist/[...id]/            # Playlist pages
│   ├── 📁 posts/                       # Posts feed
│   ├── 📁 profile/                     # User profile
│   ├── 📁 searchs/                     # Search functionality
│   ├── 📁 snips/                       # Short videos
│   └── layout.tsx                      # Main app layout
├── 📁 Policy/                          # Legal pages
│   ├── 📁 childSafety/
│   └── 📁 privacyPolicy/
├── 📁 s/[id]/                          # Short URL redirects
├── globals.css                         # Global styles
├── layout.tsx                          # Root layout
├── not-found.tsx                       # 404 page
└── page.tsx                            # Home page
```

### 🎨 Components (`/src/components`)
```
📁 components/                           # Reusable UI components
├── 📁 Avatar/                          # User avatar component
├── 📁 CommentUi/                       # Comment system UI
├── 📁 CreatePLaylist/                  # Playlist creation
├── 📁 CreateSeason/                    # Season creation for series
├── 📁 CustomFlixVideoPlayer/           # Custom video player
├── 📁 EditPlaylist/                    # Playlist editing
├── 📁 FollowButton/                    # Follow/unfollow button
├── 📁 Insights/                        # Analytics components
├── 📁 Interactive/                     # Interactive content widgets
│   ├── ImageWidget.tsx
│   ├── LinkWidget.tsx
│   ├── LocationWidget.tsx
│   ├── TextWidget.tsx
│   └── buttons.tsx
├── 📁 LayoutComponent/                 # Layout-related components
│   ├── CreationFlows.tsx
│   ├── MobileHeader.tsx
│   ├── NotificationPanel.tsx
│   ├── SearchPanel.tsx
│   └── SettingsPanel.tsx
├── 📁 SearchComponent/                 # Search functionality
│   ├── SearchComponent.tsx
│   ├── SearchMinis.tsx
│   ├── SearchSnips.tsx
│   └── SearchUsers.tsx
├── 📁 authComponent/                   # Authentication UI
│   ├── 📁 steps/                       # Multi-step auth forms
│   │   ├── DateOfBirthStep.tsx
│   │   ├── GenderStep.tsx
│   │   ├── PasswordStep.tsx
│   │   └── UsernameStep.tsx
│   ├── LoginSignupBg.tsx
│   └── OtpInput.tsx
├── 📁 createFlix/                      # Video creation flow
├── 📁 createPost/                      # Post creation
├── 📁 createSeries/                    # Series creation
├── 📁 createSnip/                      # Short video creation
├── 📁 createSsup/                      # Story creation
├── 📁 messageComponents/               # Messaging system
│   ├── ChatUI.tsx
│   ├── MessageList.tsx
│   ├── MessageReactions.tsx
│   └── chatsTypes.ts
├── 📁 modal/                           # Modal dialogs
│   ├── AboutAccountModal.tsx
│   ├── ConfirmModal.tsx
│   ├── FlixVideoModal.tsx
│   ├── FollowerModal.tsx
│   ├── SearchModal.tsx
│   └── SettingModal.tsx
├── 📁 posts/                           # Post display components
│   ├── AudioPost.tsx
│   ├── Flix.tsx
│   ├── ImagePost.tsx
│   ├── VideoPost.tsx
│   └── LikeCommentShare.tsx
├── 📁 profile/                         # Profile components
│   ├── EditProfileForm.tsx
│   ├── Highlights.tsx
│   ├── ProfileHeader.tsx
│   └── SuggestedProfiles.tsx
├── 📁 shared/                          # Shared components
│   ├── 📁 PostDetails/
│   ├── 📁 SideBar/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ImageEditor.tsx
├── 📁 story/                           # Story/Ssup components
│   ├── Story.tsx
│   ├── StoryModal.tsx
│   ├── StoryAnalytics.tsx
│   └── EmojiUi.tsx
└── 📁 suggestions/                     # Content suggestions
```

### 🔧 Services & API Layer (`/src/services`)
```
📁 services/                            # API service layer
├── 📁 auth/                            # Authentication services
│   ├── login.ts
│   ├── registration.ts
│   ├── changepassword.ts
│   └── otpverify.ts
├── createpostnewfors3.ts               # Post creation with S3
├── deletepost.ts                       # Post deletion
├── flixsearch.ts                       # Video search
├── followrequest.ts                    # Follow system
├── getStories.ts                       # Story retrieval
├── presignedurls.ts                    # S3 upload URLs
├── savepostlike.ts                     # Like functionality
├── userchatlist.ts                     # Chat services
└── userprofile.ts                      # Profile services
```

### 🎣 Hooks (`/src/hooks`)
```
📁 hooks/                               # Custom React hooks
├── 📁 LayoutHooks/                     # Layout-specific hooks
│   ├── useLayoutApi.ts
│   ├── useUIState.ts
│   └── useUserProfile.ts
├── useFetchPost.tsx                    # Post fetching logic
├── useFetchSnips.tsx                   # Snips fetching logic
├── useLocalStorage.tsx                 # Local storage management
└── useDebounce.tsx                     # Debouncing utility
```

### 🌐 Context & State (`/src/context`)
```
📁 context/                             # React Context providers
├── InAppRedirectionContext.tsx         # Navigation state
├── SearchContext.tsx                   # Search state
├── ThemeContext.tsx                    # Theme management
├── useCreationOption.tsx               # Content creation state
└── useInteractiveVideo.tsx             # Interactive video state
```

### 🛠️ Utilities (`/src/utils`)
```
📁 utils/                               # Utility functions
├── 📁 canvasRelatedUtils/              # Canvas manipulation
│   ├── addTextToCanvas.ts
│   └── initializeCanvas.ts
├── features.ts                         # Feature flags
├── fetchInterceptor.ts                 # API interceptor
├── fileupload.ts                       # File upload utilities
├── trimVideo.ts                        # Video processing
└── userRedirection.ts                  # Navigation utilities
```

### 📝 Types & Models (`/src/types` & `/src/models`)
```
📁 types/                               # TypeScript type definitions
├── buttonTypes.ts
├── fileTypes.ts
├── messageTypes.ts
├── storyTypes.ts
└── usersTypes.ts

📁 models/                              # Data models and interfaces
├── authResponse.ts                     # Authentication responses
├── postlistResponse.ts                 # Post data models
├── profileResponse.ts                  # Profile data models
├── searchResponse.ts                   # Search result models
└── storyResponse.ts                    # Story data models
```

### 🎨 Assets (`/src/assets`)
```
📁 assets/                              # Static assets
├── 📁 fonts/                           # Font files
│   ├── Arial.ttf
│   ├── Poppins-Regular.ttf
│   ├── Roboto_Black.ttf
│   └── [50+ other font files]
├── 📁 icons/                           # SVG icons
│   ├── add.svg
│   ├── delete.svg
│   ├── media.svg
│   └── trend.svg
├── blank.png                           # Placeholder images
├── logo.svg                            # App logo
└── user.png                            # Default user avatar
```

### ⚙️ Configuration & Data
```
📁 config/                              # Configuration files
├── apiConfig.ts                        # API endpoints
└── appConfig.ts                        # App settings

📁 constants/                           # Application constants
└── interactivityConstants.ts

📁 data/                                # Static data
├── buttons.json                        # Button configurations
├── fonFamily.ts                        # Font definitions
└── texts.ts                            # Text constants
```

## Configuration Files (Root Level)
```
├── .eslintrc.json                      # ESLint configuration
├── .gitignore                          # Git ignore rules
├── next.config.mjs                     # Next.js configuration
├── package.json                        # Dependencies and scripts
├── postcss.config.js                   # PostCSS configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
├── vercel.json                         # Vercel deployment config
└── README.md                           # Project documentation
```

## Key Architecture Patterns

### 🏗️ **Layered Architecture**
- **Presentation Layer**: React components and pages
- **Business Logic Layer**: Custom hooks and context providers  
- **Data Access Layer**: Services and API integration
- **Utility Layer**: Helper functions and utilities

### 🔄 **Feature-Based Organization**
Components are organized by feature (auth, posts, stories, etc.) rather than by type, making the codebase more maintainable and scalable.

### 📱 **Responsive Design**
Mobile-first approach with responsive components and layouts optimized for different screen sizes.

### 🎯 **Type Safety**
Comprehensive TypeScript integration with detailed type definitions for all data structures and API responses.#   u p d a t i n g - b i g s h o r t s  
 