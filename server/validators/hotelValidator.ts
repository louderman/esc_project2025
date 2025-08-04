// server/validators/hotelValidator.ts
import { Destination } from '../../types/Destination';

export function validateHotelParams(params: any): { dest_id: string } {
  if (!params.dest_id || typeof params.dest_id !== 'string') {
    const error = new Error('Invalid dest_id parameter');
    error.name = 'ValidationError';
    (error as any).validationErrors = {
      dest_id: 'dest_id must be a non-empty string'
    };
    throw error;
  }
  return { dest_id: params.dest_id };
}

export default { validateHotelParams };