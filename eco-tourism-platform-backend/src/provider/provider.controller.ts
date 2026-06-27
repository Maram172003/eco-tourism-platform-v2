import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ProviderService } from './provider.service';
import { OnboardingProviderDto, UpdateProviderDto } from './dto/provider.dto';

@ApiTags('Providers')
@ApiBearerAuth('bearer')
@Controller('providers')
export class ProviderController {
  constructor(private readonly service: ProviderService) {}

  // Mon profil prestataire
  @Roles(Role.PROVIDER)
  @Get('me')
  getMe(@Req() req: any) {
    return this.service.getMyProfile(req.user.sub);
  }

  // Onboarding initial
  @Roles(Role.PROVIDER)
  @Post('onboarding')
  onboard(@Req() req: any, @Body() dto: OnboardingProviderDto) {
    return this.service.onboard(req.user.sub, dto);
  }

  // Mise à jour profil
  @Roles(Role.PROVIDER)
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateProviderDto) {
    return this.service.update(req.user.sub, dto);
  }

  // Recherche publique
  @Get('search')
  search(@Query('q') q: string) {
    return this.service.search(q ?? '');
  }

  // Liste publique
  @Get()
  findAll(@Query('type') type?: string) {
    if (type) return this.service.findByType(type);
    return this.service.findAll();
  }

  // Profil public d'un prestataire
  @Get(':userId')
  getPublic(@Param('userId') userId: string) {
    return this.service.getPublicProfile(userId);
  }

  // Admin — liste en attente
  @Roles(Role.ADMIN)
  @Get('admin/pending')
  getPending() {
    return this.service.findPending();
  }

  // Admin — approuver
  @Roles(Role.ADMIN)
  @Patch('admin/:userId/approve')
  approve(@Param('userId') userId: string) {
    return this.service.approve(userId);
  }

  // Admin — rejeter
  @Roles(Role.ADMIN)
  @Patch('admin/:userId/reject')
  reject(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.service.reject(userId, reason);
  }
}
