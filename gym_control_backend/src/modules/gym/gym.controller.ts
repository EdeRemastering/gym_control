import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GymService } from './gym.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';
import { Permissions } from '../rbac/rbac.decorators';
import { SkipGymValidation } from '../../common/decorators/skip-gym-validation.decorator';

/**
 * GymController
 * HTTP endpoints for gym operations
 */
@Controller('gyms')
export class GymController {
  constructor(private readonly gymService: GymService) {}

  @Post()
  @SkipGymValidation()
  @Permissions('gym.create')
  create(@Body() dto: CreateGymDto) {
    return this.gymService.create(dto);
  }

  @Get()
  @SkipGymValidation()
  @Permissions('gym.read')
  findAll() {
    return this.gymService.findAll();
  }

  @Get(':id')
  @Permissions('gym.read')
  findOne(@Param('id') id: string) {
    return this.gymService.findOne(id);
  }

  @Patch(':id')
  @Permissions('gym.update')
  update(@Param('id') id: string, @Body() dto: UpdateGymDto) {
    return this.gymService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('gym.delete')
  remove(@Param('id') id: string) {
    return this.gymService.remove(id);
  }
}
