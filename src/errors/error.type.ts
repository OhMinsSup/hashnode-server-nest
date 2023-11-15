export type BaseErrorData<D = any> = {
  resultCode: number;
  message: string | string[] | Record<string, any> | null | undefined;
  error: string | string[] | Record<string, any> | null | undefined;
  result?: D;
};
