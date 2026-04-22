import {
  AuditOperation,
  CheckinType,
  ClassBookingStatus,
  ClassLevel,
  ClassSessionStatus,
  DiscountType,
  MealFoodUnit,
  MealType,
  MediaType,
  MembershipStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PermissionScope,
  Prisma,
  PrismaClient,
  UserActivityType,
  WorkoutSessionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.setLog.deleteMany();
  await prisma.exerciseLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.classBooking.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.fitnessClass.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.mediaComment.deleteMany();
  await prisma.mediaLike.deleteMany();
  await prisma.mediaPost.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.mealFood.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.userRoutine.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.gym.deleteMany();
}

async function main() {
  console.log('Iniciando seed completo...');
  await clearDatabase();
  const passwordHash = await bcrypt.hash('123456', 10);

  const gymA = await prisma.gym.create({
    data: {
      name: 'Gym Control Downtown',
      email: 'downtown@gymcontrol.app',
      phone: '3001002000',
      address: 'Av. Central 101',
    },
  });
  const gymB = await prisma.gym.create({
    data: {
      name: 'Gym Control North',
      email: 'north@gymcontrol.app',
      phone: '3001003000',
      address: 'Calle Norte 202',
    },
  });

  const permissions = await prisma.$transaction([
    prisma.permission.create({
      data: { name: 'user.create', resource: 'user', action: 'create', scope: PermissionScope.GYM },
    }),
    prisma.permission.create({
      data: { name: 'user.read', resource: 'user', action: 'read', scope: PermissionScope.GYM },
    }),
    prisma.permission.create({
      data: {
        name: 'payment.create',
        resource: 'payment',
        action: 'create',
        scope: PermissionScope.GYM,
      },
    }),
    prisma.permission.create({
      data: {
        name: 'payment.read',
        resource: 'payment',
        action: 'read',
        scope: PermissionScope.OWN,
      },
    }),
    prisma.permission.create({
      data: {
        name: 'class.read',
        resource: 'class',
        action: 'read',
        scope: PermissionScope.GYM,
      },
    }),
    prisma.permission.create({
      data: {
        name: 'class.create',
        resource: 'class',
        action: 'create',
        scope: PermissionScope.GYM,
      },
    }),
  ]);

  const adminRoleA = await prisma.role.create({
    data: { gymId: gymA.id, name: 'ADMIN', description: 'Administracion total' },
  });
  const trainerRoleA = await prisma.role.create({
    data: { gymId: gymA.id, name: 'TRAINER', description: 'Entrenador operativo' },
  });
  const adminRoleB = await prisma.role.create({
    data: { gymId: gymB.id, name: 'ADMIN', description: 'Administracion total' },
  });
  const trainerRoleB = await prisma.role.create({
    data: { gymId: gymB.id, name: 'TRAINER', description: 'Entrenador operativo' },
  });

  await prisma.rolePermission.createMany({
    data: [
      { roleId: adminRoleA.id, permissionId: permissions[0].id },
      { roleId: adminRoleA.id, permissionId: permissions[1].id },
      { roleId: adminRoleA.id, permissionId: permissions[2].id },
      { roleId: adminRoleA.id, permissionId: permissions[3].id },
      { roleId: trainerRoleA.id, permissionId: permissions[1].id },
      { roleId: trainerRoleA.id, permissionId: permissions[4].id },
      { roleId: adminRoleB.id, permissionId: permissions[0].id },
      { roleId: trainerRoleB.id, permissionId: permissions[5].id },
    ],
  });

  const [userA1, userA2, userB1, userB2] = await prisma.$transaction([
    prisma.user.create({
      data: {
        gymId: gymA.id,
        name: 'Admin Downtown',
        email: 'admin@gymcontrol.app',
        passwordHash,
        phone: '3001111111',
        bio: 'Admin principal',
      },
    }),
    prisma.user.create({
      data: {
        gymId: gymA.id,
        name: 'Trainer Downtown',
        email: 'trainer@gymcontrol.app',
        passwordHash,
        phone: '3001111112',
        bio: 'Entrenador principal',
      },
    }),
    prisma.user.create({
      data: {
        gymId: gymB.id,
        name: 'Admin North',
        email: 'admin.north@gymcontrol.app',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        gymId: gymB.id,
        name: 'Client North',
        email: 'client.north@gymcontrol.app',
        passwordHash,
      },
    }),
  ]);

  await prisma.userRole.createMany({
    data: [
      { gymId: gymA.id, userId: userA1.id, roleId: adminRoleA.id },
      { gymId: gymA.id, userId: userA2.id, roleId: trainerRoleA.id },
      { gymId: gymB.id, userId: userB1.id, roleId: adminRoleB.id },
      { gymId: gymB.id, userId: userB2.id, roleId: trainerRoleB.id },
    ],
  });

  const [planA, planB] = await prisma.$transaction([
    prisma.plan.create({
      data: { gymId: gymA.id, name: 'Mensual', duration: 30, price: new Prisma.Decimal(49.9) },
    }),
    prisma.plan.create({
      data: { gymId: gymB.id, name: 'Trimestral', duration: 90, price: new Prisma.Decimal(129.9) },
    }),
  ]);

  const [discountA, discountB] = await prisma.$transaction([
    prisma.discount.create({
      data: {
        gymId: gymA.id,
        name: 'Promo 10',
        code: 'PROMO10',
        type: DiscountType.PERCENTAGE,
        value: new Prisma.Decimal(10),
        startDate: new Date(),
      },
    }),
    prisma.discount.create({
      data: {
        gymId: gymB.id,
        name: 'Fijo 5',
        code: 'FIJO5',
        type: DiscountType.FIXED,
        value: new Prisma.Decimal(5),
        startDate: new Date(),
      },
    }),
  ]);

  const [membershipA, membershipB] = await prisma.$transaction([
    prisma.membership.create({
      data: {
        gymId: gymA.id,
        planId: planA.id,
        userId: userA2.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: MembershipStatus.ACTIVE,
      },
    }),
    prisma.membership.create({
      data: {
        gymId: gymB.id,
        planId: planB.id,
        userId: userB2.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: MembershipStatus.ACTIVE,
      },
    }),
  ]);

  await prisma.payment.createMany({
    data: [
      {
        gymId: gymA.id,
        userId: userA2.id,
        membershipId: membershipA.id,
        discountId: discountA.id,
        method: PaymentMethod.CARD,
        status: PaymentStatus.COMPLETED,
        amount: new Prisma.Decimal(49.9),
        discountAmount: new Prisma.Decimal(5),
        finalAmount: new Prisma.Decimal(44.9),
      },
      {
        gymId: gymB.id,
        userId: userB2.id,
        membershipId: membershipB.id,
        discountId: discountB.id,
        method: PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        amount: new Prisma.Decimal(129.9),
        discountAmount: new Prisma.Decimal(5),
        finalAmount: new Prisma.Decimal(124.9),
      },
    ],
  });

  await prisma.checkin.createMany({
    data: [
      { gymId: gymA.id, userId: userA2.id, validateBy: userA1.id, type: CheckinType.QR },
      { gymId: gymB.id, userId: userB2.id, validateBy: userB1.id, type: CheckinType.MANUAL },
    ],
  });

  const [routineA, routineB] = await prisma.$transaction([
    prisma.routine.create({ data: { gymId: gymA.id, name: 'Fuerza A', description: 'Pierna y core' } }),
    prisma.routine.create({ data: { gymId: gymB.id, name: 'Cardio B', description: 'Resistencia' } }),
  ]);

  const [exerciseA, exerciseB] = await prisma.$transaction([
    prisma.exercise.create({ data: { gymId: gymA.id, name: 'Sentadilla', description: 'Barra libre' } }),
    prisma.exercise.create({ data: { gymId: gymB.id, name: 'Burpees', description: 'Peso corporal' } }),
  ]);

  await prisma.routineExercise.createMany({
    data: [
      {
        gymId: gymA.id,
        routineId: routineA.id,
        exerciseId: exerciseA.id,
        sets: 4,
        reps: 10,
        weight: new Prisma.Decimal(40),
        position: 1,
      },
      {
        gymId: gymB.id,
        routineId: routineB.id,
        exerciseId: exerciseB.id,
        sets: 3,
        reps: 15,
        weight: new Prisma.Decimal(0),
        position: 1,
      },
    ],
  });

  await prisma.userRoutine.createMany({
    data: [
      {
        gymId: gymA.id,
        userId: userA2.id,
        routineId: routineA.id,
        assignedBy: userA1.id,
        startDate: new Date(),
      },
      {
        gymId: gymB.id,
        userId: userB2.id,
        routineId: routineB.id,
        assignedBy: userB1.id,
        startDate: new Date(),
      },
    ],
  });

  await prisma.progress.createMany({
    data: [
      {
        gymId: gymA.id,
        userId: userA2.id,
        weight: new Prisma.Decimal(70.2),
        bodyFat: new Prisma.Decimal(18.4),
        muscle: new Prisma.Decimal(34.1),
        measuredAt: new Date(),
      },
      {
        gymId: gymB.id,
        userId: userB2.id,
        weight: new Prisma.Decimal(66.3),
        bodyFat: new Prisma.Decimal(22.1),
        muscle: new Prisma.Decimal(30.2),
        measuredAt: new Date(),
      },
    ],
  });

  const [nutritionA, nutritionB] = await prisma.$transaction([
    prisma.nutritionPlan.create({
      data: {
        gymId: gymA.id,
        userId: userA2.id,
        createdBy: userA1.id,
        name: 'Nutricion Fuerza',
        startDate: new Date(),
      },
    }),
    prisma.nutritionPlan.create({
      data: {
        gymId: gymB.id,
        userId: userB2.id,
        createdBy: userB1.id,
        name: 'Nutricion Cardio',
        startDate: new Date(),
      },
    }),
  ]);

  const [mealA, mealB] = await prisma.$transaction([
    prisma.meal.create({
      data: {
        nutritionPlanId: nutritionA.id,
        dayOfWeek: 1,
        mealType: MealType.BREAKFAST,
        description: 'Avena y fruta',
        calories: 420,
      },
    }),
    prisma.meal.create({
      data: {
        nutritionPlanId: nutritionB.id,
        dayOfWeek: 2,
        mealType: MealType.DINNER,
        description: 'Pollo y vegetales',
        calories: 530,
      },
    }),
  ]);

  const [foodA, foodB] = await prisma.$transaction([
    prisma.food.create({
      data: {
        gymId: gymA.id,
        name: 'Avena',
        caloriesPer100g: 389,
        proteinPer100g: new Prisma.Decimal(16.9),
        carbsPer100g: new Prisma.Decimal(66.3),
        fatPer100g: new Prisma.Decimal(6.9),
      },
    }),
    prisma.food.create({
      data: {
        gymId: gymB.id,
        name: 'Pechuga de pollo',
        caloriesPer100g: 165,
        proteinPer100g: new Prisma.Decimal(31.0),
        carbsPer100g: new Prisma.Decimal(0),
        fatPer100g: new Prisma.Decimal(3.6),
      },
    }),
  ]);

  await prisma.mealFood.createMany({
    data: [
      { mealId: mealA.id, foodId: foodA.id, quantity: 80, unit: MealFoodUnit.g },
      { mealId: mealB.id, foodId: foodB.id, quantity: 150, unit: MealFoodUnit.g },
    ],
  });

  await prisma.userActivity.createMany({
    data: [
      { gymId: gymA.id, userId: userA2.id, type: UserActivityType.CHECKIN, metadata: { zone: 'fuerza' } },
      { gymId: gymB.id, userId: userB2.id, type: UserActivityType.PAYMENT_MADE, metadata: { amount: 124.9 } },
    ],
  });

  const [postA, postB] = await prisma.$transaction([
    prisma.post.create({ data: { gymId: gymA.id, userId: userA2.id, content: 'Entreno completado hoy!' } }),
    prisma.post.create({ data: { gymId: gymB.id, userId: userB2.id, content: 'Nueva marca personal' } }),
  ]);

  const commentA = await prisma.comment.create({
    data: { postId: postA.id, userId: userA1.id, content: 'Excelente trabajo' },
  });
  await prisma.comment.create({
    data: { postId: postB.id, userId: userB1.id, content: 'Sigue asi', parentId: commentA.id },
  });

  await prisma.postLike.createMany({
    data: [
      { postId: postA.id, userId: userA1.id },
      { postId: postB.id, userId: userB1.id },
    ],
  });

  const [mediaA, mediaB] = await prisma.$transaction([
    prisma.mediaPost.create({
      data: {
        gymId: gymA.id,
        userId: userA2.id,
        type: MediaType.IMAGE,
        mediaUrl: 'https://example.com/media-a.jpg',
        caption: 'Progreso semana 1',
      },
    }),
    prisma.mediaPost.create({
      data: {
        gymId: gymB.id,
        userId: userB2.id,
        type: MediaType.VIDEO,
        mediaUrl: 'https://example.com/media-b.mp4',
        duration: 25,
        caption: 'Rutina rapida',
      },
    }),
  ]);

  await prisma.mediaLike.createMany({
    data: [
      { mediaPostId: mediaA.id, userId: userA1.id },
      { mediaPostId: mediaB.id, userId: userB1.id },
    ],
  });

  await prisma.mediaComment.createMany({
    data: [
      { mediaPostId: mediaA.id, userId: userA1.id, content: 'Muy bien!' },
      { mediaPostId: mediaB.id, userId: userB1.id, content: 'Gran tecnica' },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        tableName: 'user',
        recordId: userA1.id,
        fieldName: 'name',
        oldValue: 'Admin Old',
        newValue: 'Admin Downtown',
        operation: AuditOperation.UPDATE,
        changedBy: userA1.id,
        changedAt: new Date(),
      },
      {
        tableName: 'payment',
        recordId: 'seed-payment-2',
        fieldName: 'status',
        oldValue: 'PENDING',
        newValue: 'COMPLETED',
        operation: AuditOperation.UPDATE,
        changedBy: userB1.id,
        changedAt: new Date(),
      },
    ],
  });

  const [classA, classB] = await prisma.$transaction([
    prisma.fitnessClass.create({
      data: {
        gymId: gymA.id,
        name: 'HIIT Morning',
        description: 'Cardio intenso',
        trainerId: userA2.id,
        capacity: 20,
        level: ClassLevel.INTERMEDIATE,
      },
    }),
    prisma.fitnessClass.create({
      data: {
        gymId: gymB.id,
        name: 'Yoga Evening',
        description: 'Movilidad y respiracion',
        trainerId: userB1.id,
        capacity: 18,
        level: ClassLevel.BEGINNER,
      },
    }),
  ]);

  const [scheduleA, scheduleB] = await prisma.$transaction([
    prisma.classSchedule.create({
      data: {
        gymId: gymA.id,
        classId: classA.id,
        dayOfWeek: 1,
        startTime: new Date('1970-01-01T08:00:00.000Z'),
        endTime: new Date('1970-01-01T09:00:00.000Z'),
      },
    }),
    prisma.classSchedule.create({
      data: {
        gymId: gymB.id,
        classId: classB.id,
        dayOfWeek: 3,
        startTime: new Date('1970-01-01T18:00:00.000Z'),
        endTime: new Date('1970-01-01T19:00:00.000Z'),
      },
    }),
  ]);

  const [sessionA, sessionB] = await prisma.$transaction([
    prisma.classSession.create({
      data: {
        gymId: gymA.id,
        classId: classA.id,
        scheduleId: scheduleA.id,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: ClassSessionStatus.SCHEDULED,
      },
    }),
    prisma.classSession.create({
      data: {
        gymId: gymB.id,
        classId: classB.id,
        scheduleId: scheduleB.id,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: ClassSessionStatus.SCHEDULED,
      },
    }),
  ]);

  await prisma.classBooking.createMany({
    data: [
      { gymId: gymA.id, sessionId: sessionA.id, userId: userA2.id, status: ClassBookingStatus.BOOKED },
      { gymId: gymB.id, sessionId: sessionB.id, userId: userB2.id, status: ClassBookingStatus.BOOKED },
    ],
  });

  const [workoutA, workoutB] = await prisma.$transaction([
    prisma.workoutSession.create({
      data: {
        gymId: gymA.id,
        userId: userA2.id,
        routineId: routineA.id,
        startedAt: new Date(),
        status: WorkoutSessionStatus.IN_PROGRESS,
      },
    }),
    prisma.workoutSession.create({
      data: {
        gymId: gymB.id,
        userId: userB2.id,
        routineId: routineB.id,
        startedAt: new Date(),
        status: WorkoutSessionStatus.COMPLETED,
      },
    }),
  ]);

  const [exerciseLogA, exerciseLogB] = await prisma.$transaction([
    prisma.exerciseLog.create({
      data: { workoutSessionId: workoutA.id, exerciseId: exerciseA.id, notes: 'Buena ejecucion' },
    }),
    prisma.exerciseLog.create({
      data: { workoutSessionId: workoutB.id, exerciseId: exerciseB.id, notes: 'Sesion completa' },
    }),
  ]);

  await prisma.setLog.createMany({
    data: [
      {
        exerciseLogId: exerciseLogA.id,
        reps: 10,
        weight: new Prisma.Decimal(40),
        duration: 45,
        restTime: 90,
      },
      {
        exerciseLogId: exerciseLogB.id,
        reps: 15,
        weight: new Prisma.Decimal(0),
        duration: 60,
        restTime: 60,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        gymId: gymA.id,
        userId: userA2.id,
        type: NotificationType.TRAINING,
        title: 'Sesion programada',
        message: 'Tienes una sesion HIIT hoy',
      },
      {
        gymId: gymB.id,
        userId: userB2.id,
        type: NotificationType.PAYMENT,
        title: 'Pago registrado',
        message: 'Tu pago fue aplicado con exito',
      },
    ],
  });

  await prisma.notificationPreference.createMany({
    data: [
      { gymId: gymA.id, userId: userA2.id, emailEnabled: true, pushEnabled: true, smsEnabled: false },
      { gymId: gymB.id, userId: userB2.id, emailEnabled: true, pushEnabled: false, smsEnabled: true },
    ],
  });

  console.log('Seed completo finalizado con exito.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error ejecutando seed completo:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
