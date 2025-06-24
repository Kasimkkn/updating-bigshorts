import { CommonResponse } from "./commonResponse";

export interface SignupData {
  username: string;
  otp: number;
  otpId: number;
  registration_type: number;
}

export interface SignupResponse extends CommonResponse<SignupData> { }

export interface OtpVerifyData {
  username: string;
  otpId: number;
  registration_type: 1 | 2;
}

export interface OtpVerifyResponse extends CommonResponse<OtpVerifyData> { }

export interface RegistrationData {
  token: string;
  userId: number;
  fullName: string;
  userName: string;
  mobileNo: string;
  pronouns: string;
  email: string;
  isallownotification: number;
  isallowtagging: number;
}


export interface RegistrationResponse extends CommonResponse<RegistrationData> { }

export interface LoginData {
  token: string;
  userId: number;
  fullName: string;
  userName: string;
  mobileNo: string;
  pronouns: string;
  email: string;
  isallownotification: number;
  isallowtagging: number;
}
export interface LoginResponse extends CommonResponse<LoginData> { }

export interface GetUsernameSuggestionResponse extends CommonResponse<[]> { }

export interface CheckUsernameExistResponse extends CommonResponse<string> { }

interface ForgotPasswordData {
  userId: number,
  username: string,
  otp: number,
  otpId: number,
}

export interface ForgotPasswordResponse extends CommonResponse<ForgotPasswordData> { }

interface VerifyOtpForgotData {
  username: string,
  userId: number,
  otpId: number,
}

export interface VerifyOtpForgotResponse extends CommonResponse<VerifyOtpForgotData> { }

export interface ChangePasswordResponse extends CommonResponse<{}> { }

export interface ChangeKnownPasswordResponse extends CommonResponse<{}> { }