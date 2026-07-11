import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { ProjectOwnerService } from './project-owner.service';
import { CompleteOwnerProfileDto } from './dto/project-owner.dto';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSustainabilityDto,
} from './dto/project.dto';

@ApiTags('Provider')
@ApiBearerAuth('bearer')
@Roles(Role.PROVIDER)
@Controller('provider')
export class ProjectOwnerController {
  constructor(private readonly service: ProjectOwnerService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Public()
  @Roles()
  @Get('venues/public')
  findActiveVenues() {
    return this.service.findActiveProjects();
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.sub);
  }

  @Post('profile')
  completeProfile(@Req() req: any, @Body() dto: CompleteOwnerProfileDto) {
    return this.service.completeProfile(req.user.sub, dto);
  }

  @Post('onboarded')
  markOnboarded(@Req() req: any) {
    return this.service.markOnboarded(req.user.sub);
  }

  // ─── Venues ─────────────────────────────────────────────────────────────

  @Get('venues')
  getVenues(@Req() req: any) {
    return this.service.getProjects(req.user.sub);
  }

  @Post('venues')
  createVenue(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.service.createProject(req.user.sub, dto);
  }

  @Patch('venues/:id')
  updateVenue(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.updateProject(req.user.sub, id, dto);
  }

  @Patch('venues/:id/sustainability')
  updateVenueSustainability(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ProjectSustainabilityDto,
  ) {
    return this.service.updateProjectSustainability(req.user.sub, id, dto);
  }

  @Delete('venues/:id')
  deleteVenue(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteProject(req.user.sub, id);
  }

  @Public()
  @Roles()
  @Get('public/search')
  searchOwners(@Query('q') q: string) {
    return this.service.searchOwners(q ?? '');
  }

  @Public()
  @Roles()
  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.service.getPublicProfile(userId);
  }
}
