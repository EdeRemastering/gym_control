import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  DiscountType,
  MembershipStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateMembershipDto {
  @IsString()
  planId: string;

  @IsString()
  userId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  membershipId?: string;

  @IsOptional()
  @IsString()
  discountId?: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  finalAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
