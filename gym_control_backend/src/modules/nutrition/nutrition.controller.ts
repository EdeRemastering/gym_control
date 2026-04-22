import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { NutritionService } from './nutrition.service';
import {
  AddMealFoodDto,
  CreateFoodDto,
  CreateMealDto,
  CreateNutritionPlanDto,
} from './dto/nutrition.dto';

@Controller('gyms/:gymId/nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('plans')
  @Permission('nutrition_plan:create')
  @Scope(PermissionScope.GYM)
  createPlan(
    @Param('gymId') gymId: string,
    @Body() dto: CreateNutritionPlanDto,
  ) {
    return this.nutritionService.createPlan(gymId, dto);
  }

  @Get('plans')
  @Permission('nutrition_plan:read')
  @Scope(PermissionScope.GYM)
  listPlans(@Param('gymId') gymId: string, @Query('userId') userId?: string) {
    return this.nutritionService.listPlans(gymId, userId);
  }

  @Post('meals')
  @Permission('meal:create')
  @Scope(PermissionScope.GYM)
  createMeal(@Param('gymId') gymId: string, @Body() dto: CreateMealDto) {
    return this.nutritionService.createMeal(gymId, dto);
  }

  @Get('meals')
  @Permission('meal:read')
  @Scope(PermissionScope.GYM)
  listMeals(
    @Param('gymId') gymId: string,
    @Query('nutritionPlanId') nutritionPlanId?: string,
  ) {
    return this.nutritionService.listMeals(gymId, nutritionPlanId);
  }

  @Post('foods')
  @Permission('food:create')
  @Scope(PermissionScope.GYM)
  createFood(@Param('gymId') gymId: string, @Body() dto: CreateFoodDto) {
    return this.nutritionService.createFood(gymId, dto);
  }

  @Get('foods')
  @Permission('food:read')
  @Scope(PermissionScope.GYM)
  listFoods(@Param('gymId') gymId: string) {
    return this.nutritionService.listFoods(gymId);
  }

  @Post('meal-foods')
  @Permission('meal_food:create')
  @Scope(PermissionScope.GYM)
  addMealFood(@Param('gymId') gymId: string, @Body() dto: AddMealFoodDto) {
    return this.nutritionService.addMealFood(gymId, dto);
  }
}
