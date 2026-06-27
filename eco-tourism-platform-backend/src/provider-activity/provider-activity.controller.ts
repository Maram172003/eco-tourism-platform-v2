import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ProviderActivityService } from './provider-activity.service';
import { CreateBulkActivitiesDto, CreateProviderActivityDto, UpdateProviderActivityDto } from './dto/provider-activity.dto';

@ApiTags('Provider Activities')
@ApiBearerAuth('bearer')
@Controller('provider-activities')
export class ProviderActivityController {
  constructor(private readonly service: ProviderActivityService) {}

  // Mes activités
  @Roles(Role.PROVIDER)
  @Get('mine')
  getMine(@Req() req: any) {
    return this.service.findByProvider(req.user.sub);
  }

  // Créer une activité
  @Roles(Role.PROVIDER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateProviderActivityDto) {
    return this.service.create(req.user.sub, dto);
  }

  // Créer plusieurs activités en une fois (onboarding)
  @Roles(Role.PROVIDER)
  @Post('bulk')
  createBulk(@Req() req: any, @Body() dto: CreateBulkActivitiesDto) {
    return this.service.createBulk(req.user.sub, dto);
  }

  // Activités d'une organisation (public)
  @Get('by-organization/:orgId')
  getByOrg(@Param('orgId') orgId: string) {
    return this.service.findByOrganization(orgId);
  }

  // Détail d'une activité (public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Modifier une activité
  @Roles(Role.PROVIDER)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProviderActivityDto) {
    return this.service.update(id, req.user.sub, dto);
  }

  // Supprimer une activité
  @Roles(Role.PROVIDER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.sub);
  }
}
