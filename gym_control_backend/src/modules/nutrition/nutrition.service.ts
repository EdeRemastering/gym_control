import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddMealFoodDto,
  CreateFoodDto,
  CreateMealDto,
  CreateNutritionPlanDto,
} from './dto/nutrition.dto';

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(gymId: string, dto: CreateNutritionPlanDto) {
    await this.ensureUser(gymId, dto.userId);
    await this.ensureUser(gymId, dto.createdBy);
    return this.prisma.nutritionPlan.create({
      data: {
        gymId,
        userId: dto.userId,
        createdBy: dto.createdBy,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  listPlans(gymId: string, userId?: string) {
    return this.prisma.nutritionPlan.findMany({
      where: { gymId, deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createMeal(gymId: string, dto: CreateMealDto) {
    await this.ensurePlan(gymId, dto.nutritionPlanId);
    return this.prisma.meal.create({ data: dto });
  }
  async listMeals(gymId: string, nutritionPlanId?: string) {
    return this.prisma.meal.findMany({
      where: {
        ...(nutritionPlanId ? { nutritionPlanId } : {}),
        nutritionPlan: { gymId, deletedAt: null },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      take: 500,
    });
  }

  async createFood(gymId: string, dto: CreateFoodDto) {
    return this.prisma.food.create({ data: { gymId, ...dto } });
  }

  listFoods(gymId: string) {
    return this.prisma.food.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async addMealFood(gymId: string, dto: AddMealFoodDto) {
    await this.ensureMealInGym(gymId, dto.mealId);
    await this.ensureFood(gymId, dto.foodId);
    return this.prisma.mealFood.create({ data: dto });
  }

  private async ensureUser(gymId: string, userId: string) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('User not found');
  }
  private async ensurePlan(gymId: string, nutritionPlanId: string) {
    const row = await this.prisma.nutritionPlan.findFirst({
      where: { id: nutritionPlanId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Nutrition plan not found');
  }
  private async ensureMealInGym(gymId: string, mealId: string) {
    const row = await this.prisma.meal.findFirst({
      where: { id: mealId, nutritionPlan: { gymId, deletedAt: null } },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Meal not found');
  }
  private async ensureFood(gymId: string, foodId: string) {
    const row = await this.prisma.food.findFirst({
      where: { id: foodId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Food not found');
  }
}
