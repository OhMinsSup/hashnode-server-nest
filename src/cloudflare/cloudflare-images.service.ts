import axios from 'axios';
import FormData from 'form-data';
import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '../integrations/environment/environment.service';
import {
  type CloudflareImageDetailResponse,
  type CloudflareImageUploadParams,
  type CloudflareDirectUploadResponse,
  type CloudflareUploadResponse,
} from './cloudflare-images.types';

export const CLOUDFLARE = {
  URL: new URL('https://api.cloudflare.com'),
  CF_DIRECT_UPLOAD: (cfId: string) =>
    `/client/v4/accounts/${cfId}/images/v2/direct_upload`,
  CF_IMAGE_INFO: (cfId: string, imgId: string) =>
    `/client/v4/accounts/${cfId}/images/v1/${imgId}`,
  CF_UPLOAD_IMAGE: (cfId: string) => `/client/v4/accounts/${cfId}/images/v1`,
};

@Injectable()
export class CloudflareImagesService {
  constructor(private readonly env: EnvironmentService) {}

  /**
   * @description cloudflare images 직접 업로드
   * @param {Express.Multer.File} file
   * @param {CloudflareImageUploadParams} params
   */
  async uploadImage(
    file: Express.Multer.File,
    params?: CloudflareImageUploadParams & { url?: string },
  ) {
    const formData = new FormData();

    formData.append('file', file.buffer);

    if (params?.signedURL) {
      formData.append('requireSignedURLs', params.signedURL ? 'true' : 'false');
    }

    if (params?.meta) {
      formData.append('metadata', JSON.stringify(params.meta));
    }

    if (params?.url) {
      formData.append('url', params.url);
    }

    const request = new URL(
      CLOUDFLARE.CF_UPLOAD_IMAGE(this.env.getCloudflareAccountId()),
      CLOUDFLARE.URL,
    );

    const url = request.toString();

    const response = await axios.post<CloudflareImageDetailResponse>(
      url,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.env.getCloudflareApiKey()}`,
        },
      },
    );

    return {
      id: response.data?.result?.id ?? null,
      url: response.data?.result?.variants[0] ?? null,
      errors: response.data?.errors ?? [],
    };
  }

  /**
   * @description cloudflare images 업로드
   * @param {Express.Multer.File} file
   * @param {string} uploadURL
   */
  async upload(file: Express.Multer.File, uploadURL: string) {
    const response = await axios.post<CloudflareUploadResponse>(
      uploadURL,
      file.buffer,
    );

    return response.data;
  }

  /**
   * @description cloudflare images direct upload 요청 url 생성
   * @param {CloudflareImageUploadParams} params
   */
  async getDirectUploadURL(params?: CloudflareImageUploadParams) {
    const formData = new FormData();

    if (params?.signedURL) {
      formData.append('requireSignedURLs', params.signedURL ? 'true' : 'false');
    }

    if (params?.meta) {
      formData.append('metadata', JSON.stringify(params.meta));
    }

    const count = formData.getLengthSync();

    const request = new URL(
      CLOUDFLARE.CF_DIRECT_UPLOAD(this.env.getCloudflareAccountId()),
      CLOUDFLARE.URL,
    );

    const url = request.toString();

    const response = await axios.post<CloudflareDirectUploadResponse>(
      url,
      count > 0 ? formData : null,
      {
        headers: {
          Authorization: `Bearer ${this.env.getCloudflareApiKey()}`,
        },
      },
    );

    return {
      id: response.data?.result?.id ?? null,
      uploadURL: response.data?.result?.uploadURL ?? null,
      errors: response.data?.errors ?? [],
    };
  }

  /**
   * @description cloudflare images 이미지 정보 조회
   * @param {string} imagId
   */
  async getImageInfo(imagId: string) {
    const request = new URL(
      CLOUDFLARE.CF_IMAGE_INFO(this.env.getCloudflareAccountId(), imagId),
      CLOUDFLARE.URL,
    );

    const url = request.toString();

    const response = await axios.get<CloudflareImageDetailResponse>(url, {
      headers: {
        Authorization: `Bearer ${this.env.getCloudflareApiKey()}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      image: response.data.result,
    };
  }
}
