import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareImagesService } from './cloudflare-images.service';

describe('CloudflareImagesService', () => {
  let service: CloudflareImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudflareImagesService],
    }).compile();

    service = module.get<CloudflareImagesService>(CloudflareImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
