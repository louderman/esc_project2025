// server/validators/hotelValidator.ts
import { Request } from 'express';

export function validateHotelParams(params: any): { uid: string } {
  if (!params.uid || typeof params.uid !== 'string') {
    const error = new Error('Invalid UID parameter');
    (error as any).validationErrors = {
      uid: 'UID must be a non-empty string'
    };
    throw error;
  }
  return { uid: params.uid };
}

export default { validateHotelParams };