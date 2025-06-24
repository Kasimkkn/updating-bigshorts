import { getUserPlaylists } from "@/services/getuserplaylists";
import { hash } from "crypto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('API_BASE_URL is not defined in environment variables');
}

const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/app/auth/signup`,
    otpVerify: `${API_BASE_URL}/app/auth/otpverifyV2`,
    registration: `${API_BASE_URL}/app/auth/registration`,
    login: `${API_BASE_URL}/app/loginV1`,
    usernameSuggestion: `${API_BASE_URL}/app/getusernamesuggestion`,
    checkUsernameExist: `${API_BASE_URL}/app/auth/checkusernameexistV1`,
    forgotPassword: `${API_BASE_URL}/app/sendforgotpasswordotpV1`,
    changePassword: `${API_BASE_URL}/app/changepasswordV1`,
    changeKnownPassword: `${API_BASE_URL}/app/auth/changepasswordsettingsV1`,
    otpVerifyForgot: `${API_BASE_URL}/app/verifyforgotpasswordotpV1`,
    updateEmail: `${API_BASE_URL}/app/auth/updateemail`,
    updatePhone: `${API_BASE_URL}/app/auth/updateNumber`,
    contactChangeOtpVerify: `${API_BASE_URL}/app/auth/verifycontactchangeotp`,
  },
  userProfile: {
    getProfile: `${API_BASE_URL}/app/userprofileV2`,
    getPostUserDetails: `${API_BASE_URL}/app/userprofilepostlistV2`,
    getFlixDetails: `${API_BASE_URL}/app/userprofileflixlistV2`,
    getFanList: `${API_BASE_URL}/app/fanlistforuserV2`,
    getFriendList: `${API_BASE_URL}/app/userfriendlistV2`,
    addFriend: `${API_BASE_URL}/app/addfriendV2`,
    acceptFriend: `${API_BASE_URL}/app/acceptFriendV2`,
    followRequest: `${API_BASE_URL}/app/followrequestV2`,
    blockUser: `${API_BASE_URL}/app/saveuserblockV2`,
    updateProfile: `${API_BASE_URL}/app/updateuserprofilenewfors3V2`,
    getSuggestions: `${API_BASE_URL}/app/suggestionlistforuserV2`,
    setPrivateAccount: `${API_BASE_URL}/app/privateaccountV2`,
    removeFollower: `${API_BASE_URL}/app/removefriendentryV2`,
    accountOverview: `${API_BASE_URL}/app/accountoverview`,
    getAboutProfile: `${API_BASE_URL}/app/aboutprofileV2`,
    getMutualFriends: `${API_BASE_URL}/app/getmutualfriendsV2`,
    report: `${API_BASE_URL}/app/saveuserreportV2`,
  },

  chat: {
    getSelectedUserInChatList: `${API_BASE_URL}/app/getselecteduserinchatlistV2`,
    userChatList: `${API_BASE_URL}/app/chatuserlistV2`,
  },

  saved: {
    all: `${API_BASE_URL}/app/usersavedpostandaudiolistV2`,
    videos: `${API_BASE_URL}/app/usersavedvideolistV2`,
    audio: `${API_BASE_URL}/app/getuserbookmarklistV2`,
    images: `${API_BASE_URL}/app/usersavedimagelistV2`,
    flix: `${API_BASE_URL}/app/usersavedflixlistV2`
  },

  post: {

    list: `${API_BASE_URL}/app/postlistV2`,
    delete: `${API_BASE_URL}/app/deletepostV2`,
    mute: `${API_BASE_URL}/app/mutepostsV2`,
    details: `${API_BASE_URL}/app/getpostdetailsV2`,
    create: `${API_BASE_URL}/app/createpostnewfors3V2`,
    saveOtherPost: `${API_BASE_URL}/app/saveotherpostV2`,
    report: `${API_BASE_URL}/app/savepostreportV2`,
    share: `${API_BASE_URL}/app/savepostshareV2`,
    collaborators: `${API_BASE_URL}/app/getcollaborativepostusersV2`,
    requestedCollaborators: `${API_BASE_URL}/app/getcollaborativerequestedusersV2`,
    acceptCollaborativeInvite: `${API_BASE_URL}/app/updatecollaborativepoststatusV2`,
    hashtag: `${API_BASE_URL}/app/discoverhashtagpostlistopt`,
    comments: {
      list: `${API_BASE_URL}/app/postcommentlistV2`,
      save: `${API_BASE_URL}/app/savepostcommentV2`,
      like: `${API_BASE_URL}/app/savecommentlikeV2`,
      pinReportDelete: `${API_BASE_URL}/app/commentpinreoprtdeleteV2`,
    },
    polls: {
      get: `${API_BASE_URL}/app/getpollbypostV2`
    },
    likes: {
      post: `${API_BASE_URL}/app/savepostlikeV2`,
      video: `${API_BASE_URL}/app/savevideolikeV2`,
      likeDetails: `${API_BASE_URL}/app/getlikedetailsV2`,
    },
    video: {
      getCount: `${API_BASE_URL}/app/getGetVideoCountV2?videoId=:videoId`
    },
    insights: {
      getinsights: `${API_BASE_URL}/app/getinsightsV2`,
      getImagePostInsights: `${API_BASE_URL}/app/getimagepostinsightsV2`
    }
  },

  highlight: {
    create: `${API_BASE_URL}/app/createhighlightV2`,
    getHighlightList: `${API_BASE_URL}/app/getuserhighlightsV2`,
    getHighlightStories: `${API_BASE_URL}/app/gethighlightstoriesV2`,
    delete: `${API_BASE_URL}/app/deletehighlightV2`,
  },
  linkOldVideo: {
    linkOldSnip: `${API_BASE_URL}/app/postListToLinkOldVideoPaginatedV2`,
    linkOldMini: `${API_BASE_URL}/app/flixListToLinkOldVideoPaginatedV2`
  },
  flix: {
    list: `${API_BASE_URL}/app/flixlistV2`,
    delete: `${API_BASE_URL}/app/deleteflixV2`,
    details: `${API_BASE_URL}/app/getflixdetailsV2`,
    search: `${API_BASE_URL}/app/flixsearchV2`,
    snip: `${API_BASE_URL}/app/snipsearchV2`,
    saveOtherFlix: `${API_BASE_URL}/app/saveotherflixV2`,
    create: `${API_BASE_URL}/app/createflixnewfors3V2`,
    comments: {
      list: `${API_BASE_URL}/app/flixcommentlist`,
      save: `${API_BASE_URL}/app/saveflixcommentV2`,
      like: `${API_BASE_URL}/app/saveflixcommentlikeV2`,
      pinReportDelete: `${API_BASE_URL}/app/flixcommentpinreoprtdeleteV2`,
      likeList: `${API_BASE_URL}app/userflixcommentlikelistV2`,
    },
    getGenreList: {
      genrelist: `${API_BASE_URL}/app/getAllGenresV2`
    },
    polls: {
      get: `${API_BASE_URL}/app/getpollbyflixV2`
    },
    likes: {
      save: `${API_BASE_URL}/app/saveflixlikeV2`
    },
    series: {
      seriesList: `${API_BASE_URL}/app/getserieslistV2`,
      seasonFlix: `${API_BASE_URL}/app/getseasonflixdetailsV2`,
      getUserSeries: `${API_BASE_URL}/app/getseriesidfromuseridV2`,
      getSeasonDetails: `${API_BASE_URL}/app/getseasondetailsV2`,
      create: `${API_BASE_URL}/app/createserieswithepisodesV2`,
      editSeason: `${API_BASE_URL}/app/editseasonV2`,
    },
    playlists: {
      getUserPlaylists: `${API_BASE_URL}/app/getuserplaylistsV2`,
      getPlayListsList: `${API_BASE_URL}/app/getplaylistslistV2`,
      playlistFlixDetails: `${API_BASE_URL}/app/getplaylistflixdetailsV2`,
    },
    miniWatchHistory: {
      insertWatchHistory: `${API_BASE_URL}/app/flix/saveV2`,
      getWatchHistory: `${API_BASE_URL}/app/flix/profilelistV2`,
      deleteVideo: `${API_BASE_URL}/app/flix/videodeleteV2`,
      clear: `${API_BASE_URL}/app/flix/clearV2`
    },
  },

  stories: {
    get: `${API_BASE_URL}/app/getstoriesV2`,
    getProfile: `${API_BASE_URL}/app/getstoriesprofilepageV2`,
    removeViewRestriction: `${API_BASE_URL}/app/removestoryviewrestriction`,
    restrictView: `${API_BASE_URL}/app/restrictstoryviewV2`,
    reply: `${API_BASE_URL}/app/storyreply`,
    reaction: `${API_BASE_URL}/app/storyreactionV1`,
    addViewCount: `${API_BASE_URL}/app/addstoryviewcountsV2`,
    mute: `${API_BASE_URL}/app/mutestoryV2`,
    unmute: `${API_BASE_URL}/app/unmutestoryV2`,
    getInsights: `${API_BASE_URL}/app/getstoryinsightsV2`,
    getStoryViewrList: `${API_BASE_URL}/app/getstoryviewerlistV2`
  },

  shared: {
    search: `${API_BASE_URL}/app/discoversearchV2`,
    appSuggestions: `${API_BASE_URL}/app/appusersuggestionlisV2`,
    notifications: {
      push: `${API_BASE_URL}/app/getpushnotificationV2`,
      alert: `${API_BASE_URL}/app/notificationalertV2`
    },
    requests: `${API_BASE_URL}/app/getrequestsV2`,
    messageCount: `${API_BASE_URL}/app/getmessagecountV2`,
    trendingCreators: `${API_BASE_URL}/app/trendingcreatorsV2`,
    fcmToken: {
      store: `${API_BASE_URL}/app/storeuserfcmtoken`,
      delete: `${API_BASE_URL}/app/deletefcmtokens`
    },
    searchHashtag: `${API_BASE_URL}/app/hashtagsearchV2`,
    hashtagList: `${API_BASE_URL}/app/hashtaglist`,
  },

  settings: {
    feedback: `${API_BASE_URL}/app/savefeedbackV2`,
    update: `${API_BASE_URL}/app/updatesettingsV2`,
    getMutedUsers: `${API_BASE_URL}/app/getmutedusersV2`,
    getBlockedUsers: `${API_BASE_URL}/app/getblockedusersV2`,
    getArchives: `${API_BASE_URL}/app/getarchivesv2`
  },

  upload: {
    getPresignedUrl: `${API_BASE_URL}/app/presignedurlforupload`
  }
};

export default API_ENDPOINTS;
