import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MealFoodUnit, MealType } from '@prisma/client';

export class CreateNutritionPlanDto {
  @IsString()
  userId: string;
  @IsString()
  createdBy: string;
  @IsString()
  name: string;
  @IsDateString()
  startDate: string;
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateMealDto {
  @IsString()
  nutritionPlanId: string;
  @IsInt()
  dayOfWeek: number;
  @IsEnum(MealType)
  mealType: MealType;
  @IsString()
  description: string;
  @IsOptional()
  @IsInt()
  calories?: number;
}

export class CreateFoodDto {
  @IsString()
  name: string;
  @IsInt()
  caloriesPer100g: number;
  @IsNumber()
  proteinPer100g: number;
  @IsNumber()
  carbsPer100g: number;
  @IsNumber()
  fatPer100g: number;
}

export class AddMealFoodDto {
  @IsString()
  mealId: string;
  @IsString()
  foodId: string;
  @IsInt()
  quantity: number;
  @IsEnum(MealFoodUnit)
  unit: MealFoodUnit;
}
