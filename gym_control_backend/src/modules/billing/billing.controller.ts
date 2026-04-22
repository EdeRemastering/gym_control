import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { BillingService } from './billing.service';
import {
  CreateDiscountDto,
  CreateMembershipDto,
  CreatePaymentDto,
  CreatePlanDto,
} from './dto/billing.dto';

@Controller('gyms/:gymId/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('plans')
  @Permission('plan:create')
  @Scope(PermissionScope.GYM)
  createPlan(@Param('gymId') gymId: string, @Body() dto: CreatePlanDto) {
    return this.billingService.createPlan(gymId, dto);
  }

  @Get('plans')
  @Permission('plan:read')
  @Scope(PermissionScope.GYM)
  listPlans(@Param('gymId') gymId: string) {
    return this.billingService.listPlans(gymId);
  }

  @Post('memberships')
  @Permission('membership:create')
  @Scope(PermissionScope.GYM)
  createMembership(
    @Param('gymId') gymId: string,
    @Body() dto: CreateMembershipDto,
  ) {
    return this.billingService.createMembership(gymId, dto);
  }

  @Get('memberships')
  @Permission('membership:read')
  @Scope(PermissionScope.GYM)
  listMemberships(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.billingService.listMemberships(gymId, userId);
  }

  @Post('payments')
  @Permission('payment:create')
  @Scope(PermissionScope.GYM)
  createPayment(@Param('gymId') gymId: string, @Body() dto: CreatePaymentDto) {
    return this.billingService.createPayment(gymId, dto);
  }

  @Get('payments')
  @Permission('payment:read')
  @Scope(PermissionScope.GYM)
  listPayments(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.billingService.listPayments(gymId, userId);
  }

  @Post('discounts')
  @Permission('discount:create')
  @Scope(PermissionScope.GYM)
  createDiscount(
    @Param('gymId') gymId: string,
    @Body() dto: CreateDiscountDto,
  ) {
    return this.billingService.createDiscount(gymId, dto);
  }

  @Get('discounts')
  @Permission('discount:read')
  @Scope(PermissionScope.GYM)
  listDiscounts(@Param('gymId') gymId: string) {
    return this.billingService.listDiscounts(gymId);
  }
}
