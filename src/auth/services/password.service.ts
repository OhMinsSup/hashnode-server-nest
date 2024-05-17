import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import utils from 'node:util';
import { EnvironmentService } from '../../integrations/environment/environment.service';

const randomBytesPromise = utils.promisify(crypto.randomBytes);
const pbkdf2Promise = utils.promisify(crypto.pbkdf2);

@Injectable()
export class PasswordService {
  constructor(private readonly env: EnvironmentService) {}

  async createSalt() {
    const buf = await randomBytesPromise(64);

    return buf.toString('base64');
  }

  hash(password: string) {
    return crypto.createHash('sha512').update(password).digest('base64');
  }

  async hashPassword(password: string) {
    const salt = await this.createSalt();
    const key = await pbkdf2Promise(password, salt, 104906, 64, 'sha512');
    const hashedPassword = key.toString('base64');

    return {
      salt,
      hashedPassword,
    };
  }

  async verifyPassword(password: string, salt: string, userPassword: string) {
    const key = await pbkdf2Promise(password, salt, 104906, 64, 'sha512');

    const hashedPassword = key.toString('base64');

    if (hashedPassword === userPassword) {
      return true;
    }

    return false;
  }
}
