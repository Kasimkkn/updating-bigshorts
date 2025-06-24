export interface CommonResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
  }