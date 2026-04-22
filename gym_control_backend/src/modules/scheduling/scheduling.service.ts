import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateClassBookingDto,
  CreateClassDto,
  CreateClassScheduleDto,
  CreateClassSessionDto,
  UpdateClassBookingDto,
  UpdateClassDto,
  UpdateClassScheduleDto,
  UpdateClassSessionDto,
} from './dto/scheduling.dto';

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async createClass(gymId: string, dto: CreateClassDto) {
    return this.prisma.fitnessClass.create({
      data: { gymId, ...dto },
      select: this.classSelect,
    });
  }

  async listClasses(gymId: string) {
    return this.prisma.fitnessClass.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: this.classSelect,
      take: 100,
    });
  }

  async updateClass(gymId: string, classId: string, dto: UpdateClassDto) {
    await this.ensureClass(gymId, classId);
    return this.prisma.fitnessClass.update({
      where: { id: classId },
      data: dto,
      select: this.classSelect,
    });
  }

  async deleteClass(gymId: string, classId: string) {
    await this.ensureClass(gymId, classId);
    return this.prisma.fitnessClass.update({
      where: { id: classId },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });
  }

  async createSchedule(gymId: string, dto: CreateClassScheduleDto) {
    await this.ensureClass(gymId, dto.classId);
    return this.prisma.classSchedule.create({
      data: {
        gymId,
        classId: dto.classId,
        dayOfWeek: dto.dayOfWeek,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        isActive: dto.isActive ?? true,
      },
      select: this.scheduleSelect,
    });
  }

  async updateSchedule(
    gymId: string,
    scheduleId: string,
    dto: UpdateClassScheduleDto,
  ) {
    await this.ensureSchedule(gymId, scheduleId);
    return this.prisma.classSchedule.update({
      where: { id: scheduleId },
      data: {
        ...dto,
        ...(dto.startTime ? { startTime: new Date(dto.startTime) } : {}),
        ...(dto.endTime ? { endTime: new Date(dto.endTime) } : {}),
      },
      select: this.scheduleSelect,
    });
  }

  async createSession(gymId: string, dto: CreateClassSessionDto) {
    await this.ensureClass(gymId, dto.classId);
    if (dto.scheduleId) {
      await this.ensureSchedule(gymId, dto.scheduleId);
    }

    return this.prisma.classSession.create({
      data: {
        gymId,
        classId: dto.classId,
        scheduleId: dto.scheduleId,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: dto.status ?? 'SCHEDULED',
      },
      select: this.sessionSelect,
    });
  }

  async listSessions(gymId: string, fromDate?: string) {
    return this.prisma.classSession.findMany({
      where: {
        gymId,
        ...(fromDate ? { date: { gte: new Date(fromDate) } } : {}),
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      select: this.sessionSelect,
      take: 200,
    });
  }

  async updateSession(
    gymId: string,
    sessionId: string,
    dto: UpdateClassSessionDto,
  ) {
    await this.ensureSession(gymId, sessionId);
    return this.prisma.classSession.update({
      where: { id: sessionId },
      data: {
        ...dto,
        ...(dto.startTime ? { startTime: new Date(dto.startTime) } : {}),
        ...(dto.endTime ? { endTime: new Date(dto.endTime) } : {}),
      },
      select: this.sessionSelect,
    });
  }

  async createBooking(gymId: string, dto: CreateClassBookingDto) {
    const session = await this.ensureSession(gymId, dto.sessionId);
    const klass = await this.ensureClass(gymId, session.classId);
    await this.ensureUser(gymId, dto.userId);

    const bookedCount = await this.prisma.classBooking.count({
      where: {
        gymId,
        sessionId: dto.sessionId,
        status: 'BOOKED',
      },
    });

    if (bookedCount >= klass.capacity) {
      throw new BadRequestException('Class session is full');
    }

    return this.prisma.classBooking.create({
      data: {
        gymId,
        sessionId: dto.sessionId,
        userId: dto.userId,
        status: 'BOOKED',
      },
      select: this.bookingSelect,
    });
  }

  async updateBooking(
    gymId: string,
    bookingId: string,
    dto: UpdateClassBookingDto,
  ) {
    await this.ensureBooking(gymId, bookingId);
    return this.prisma.classBooking.update({
      where: { id: bookingId },
      data: { status: dto.status },
      select: this.bookingSelect,
    });
  }

  async listBookings(gymId: string, userId?: string) {
    return this.prisma.classBooking.findMany({
      where: {
        gymId,
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: this.bookingSelect,
      take: 200,
    });
  }

  private async ensureClass(gymId: string, classId: string) {
    const klass = await this.prisma.fitnessClass.findFirst({
      where: { id: classId, gymId, deletedAt: null },
      select: {
        id: true,
        capacity: true,
      },
    });
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
    return { id: klass.id, capacity: klass.capacity };
  }

  private async ensureSchedule(gymId: string, scheduleId: string) {
    const schedule = await this.prisma.classSchedule.findFirst({
      where: { id: scheduleId, gymId },
      select: { id: true },
    });
    if (!schedule) {
      throw new NotFoundException('Class schedule not found');
    }
    return schedule;
  }

  private async ensureSession(gymId: string, sessionId: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id: sessionId, gymId },
      select: { id: true, classId: true },
    });
    if (!session) {
      throw new NotFoundException('Class session not found');
    }
    return session;
  }

  private async ensureBooking(gymId: string, bookingId: string) {
    const booking = await this.prisma.classBooking.findFirst({
      where: { id: bookingId, gymId },
      select: { id: true },
    });
    if (!booking) {
      throw new NotFoundException('Class booking not found');
    }
  }

  private async ensureUser(gymId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private readonly classSelect = {
    id: true,
    gymId: true,
    name: true,
    description: true,
    trainerId: true,
    capacity: true,
    level: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly scheduleSelect = {
    id: true,
    gymId: true,
    classId: true,
    dayOfWeek: true,
    startTime: true,
    endTime: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly sessionSelect = {
    id: true,
    gymId: true,
    classId: true,
    scheduleId: true,
    date: true,
    startTime: true,
    endTime: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly bookingSelect = {
    id: true,
    gymId: true,
    sessionId: true,
    userId: true,
    status: true,
    createdAt: true,
  };
}
