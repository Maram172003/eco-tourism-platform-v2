import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { ProviderService } from './provider.service';
import { UpdateProviderDto } from './dto/provider.dto';
import { CompleteOwnerProfileDto } from './dto/owner-profile.dto';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSustainabilityDto,
} from './dto/venue.dto';

@ApiTags('Providers')
@Controller('providers')
export class ProviderController {
  constructor(private readonly service: ProviderService) {}

  // ─── Self ─────────────────────────────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('me')
  findMe(@Req() req: any) {
    return this.service.findByUserId(req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProviderDto) {
    return this.service.update(req.user.sub, dto);
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('profile')
  completeProfile(@Req() req: any, @Body() dto: CompleteOwnerProfileDto) {
    return this.service.completeProfile(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('onboarded')
  markOnboarded(@Req() req: any) {
    return this.service.markOnboarded(req.user.sub);
  }

  // ─── Venues ──────────────────────────────────────────────────────────────

  @Public()
  @Get('venues/public')
  findActiveVenues() {
    return this.service.findActiveVenues();
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('venues')
  getVenues(@Req() req: any) {
    return this.service.getVenues(req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('venues')
  createVenue(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.service.createVenue(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('venues/:id')
  updateVenue(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.updateVenue(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('venues/:id/sustainability')
  updateVenueSustainability(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ProjectSustainabilityDto,
  ) {
    return this.service.updateVenueSustainability(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('venues/:id')
  deleteVenue(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteVenue(req.user.sub, id);
  }

  // ─── Public ──────────────────────────────────────────────────────────────

  @Public()
  @Get('public/search')
  searchOwners(@Query('q') q: string) {
    return this.service.searchOwners(q ?? '');
  }

  @Public()
  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.service.getPublicProfile(userId);
  }

  // ─── Generic (MUST be last — catches /providers/:id) ────────────────────

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
