import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ProviderActivityService } from './provider-activity.service';
import { CreateProviderActivityDto, UpdateProviderActivityDto } from './dto/provider-activity.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ProviderActivities')
@Controller('provider-activities')
export class ProviderActivityController {
  constructor(private readonly service: ProviderActivityService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post()
  create(@Body() dto: CreateProviderActivityDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProviderActivityDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Public()
  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.service.findByProviderId(providerId);
  }

  @Public()
  @Get('organization/:orgId')
  findByOrganization(@Param('orgId') orgId: string) {
    return this.service.findByOrganizationId(orgId);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
