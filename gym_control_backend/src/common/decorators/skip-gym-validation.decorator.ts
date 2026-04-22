import { SetMetadata } from '@nestjs/common';

export const SKIP_GYM_VALIDATION = 'skipGymValidation';
export const SkipGymValidation = () => SetMetadata(SKIP_GYM_VALIDATION, true);
