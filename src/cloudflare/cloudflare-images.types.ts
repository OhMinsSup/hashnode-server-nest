export type CloudflareCommonResponse<Result = unknown> = {
  result: Result;
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: Array<{
    code: number;
    message: string;
  }>;
};

export type CloudflareUploadResponse = CloudflareCommonResponse<{
  id: string;
  metadata: Record<string, string>;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
  draft: boolean;
}>;

export type CloudflareDirectUploadResponse = CloudflareCommonResponse<{
  id: string;
  uploadURL: string;
}>;

export type CloudflareImageDetailResponse = CloudflareCommonResponse<{
  filename: string;
  id: string;
  meta: Record<string, string>;
  requireSignedURLs: boolean;
  uploaded: string;
  variants: string[];
}>;

export type CloudflareImageUploadParams = {
  meta?: Record<string, string | number>;
  signedURL?: boolean;
};
