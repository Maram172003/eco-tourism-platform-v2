import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@ApiTags('Organizations')
@ApiBearerAuth('bearer')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  // Mon organisation
  @Roles(Role.PROVIDER)
  @Get('me')
  getMe(@Req() req: any) {
    return this.service.getMyOrganization(req.user.sub);
  }

  // Créer / onboarding organisation
  @Roles(Role.PROVIDER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrganizationDto) {
    return this.service.create(req.user.sub, dto);
  }

  // Mettre à jour mon organisation
  @Roles(Role.PROVIDER)
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(req.user.sub, dto);
  }

  // Profil public par provider_id
  @Get('by-provider/:providerId')
  getByProvider(@Param('providerId') providerId: string) {
    return this.service.getPublicByProvider(providerId);
  }

  // Profil public par org id
  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.service.getPublic(id);
  }

  // Admin — approuver
  @Roles(Role.ADMIN)
  @Patch('admin/:id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }
}
