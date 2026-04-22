import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDiscountDto,
  CreateMembershipDto,
  CreatePaymentDto,
  CreatePlanDto,
} from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(gymId: string, dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: { gymId, ...dto },
      select: {
        id: true,
        gymId: true,
        name: true,
        duration: true,
        price: true,
      },
    });
  }

  async listPlans(gymId: string) {
    return this.prisma.plan.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        createdAt: true,
      },
    });
  }

  async createMembership(gymId: string, dto: CreateMembershipDto) {
    await this.ensurePlan(gymId, dto.planId);
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.membership.create({
      data: {
        gymId,
        planId: dto.planId,
        userId: dto.userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'ACTIVE',
      },
      select: {
        id: true,
        gymId: true,
        planId: true,
        userId: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  async listMemberships(gymId: string, userId?: string) {
    return this.prisma.membership.findMany({
      where: { gymId, deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        planId: true,
        userId: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  async createPayment(gymId: string, dto: CreatePaymentDto) {
    await this.ensureUser(gymId, dto.userId);
    if (dto.membershipId) await this.ensureMembership(gymId, dto.membershipId);
    if (dto.discountId) await this.ensureDiscount(gymId, dto.discountId);
    return this.prisma.payment.create({
      data: {
        gymId,
        userId: dto.userId,
        membershipId: dto.membershipId,
        discountId: dto.discountId,
        method: dto.method,
        status: dto.status ?? 'COMPLETED',
        amount: dto.amount,
        discountAmount: dto.discountAmount ?? 0,
        finalAmount: dto.finalAmount,
        notes: dto.notes,
      },
      select: {
        id: true,
        userId: true,
        membershipId: true,
        status: true,
        method: true,
        finalAmount: true,
        createdAt: true,
      },
    });
  }

  async listPayments(gymId: string, userId?: string) {
    return this.prisma.payment.findMany({
      where: { gymId, deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        userId: true,
        status: true,
        method: true,
        finalAmount: true,
        createdAt: true,
      },
    });
  }

  async createDiscount(gymId: string, dto: CreateDiscountDto) {
    return this.prisma.discount.create({
      data: {
        gymId,
        name: dto.name,
        code: dto.code,
        type: dto.type,
        value: dto.value,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      select: {
        id: true,
        gymId: true,
        name: true,
        code: true,
        type: true,
        value: true,
        isActive: true,
      },
    });
  }

  async listDiscounts(gymId: string) {
    return this.prisma.discount.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        value: true,
        isActive: true,
      },
    });
  }

  private async ensureUser(gymId: string, userId: string) {
    const exists = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('User not found');
  }
  private async ensurePlan(gymId: string, planId: string) {
    const exists = await this.prisma.plan.findFirst({
      where: { id: planId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Plan not found');
  }
  private async ensureMembership(gymId: string, membershipId: string) {
    const exists = await this.prisma.membership.findFirst({
      where: { id: membershipId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Membership not found');
  }
  private async ensureDiscount(gymId: string, discountId: string) {
    const exists = await this.prisma.discount.findFirst({
      where: { id: discountId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Discount not found');
  }
}
