import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { ProjectOwnerService } from './project-owner.service';
import { CompleteOwnerProfileDto } from './dto/project-owner.dto';
import { CreateProjectDto, UpdateProjectDto, ProjectSustainabilityDto } from './dto/project.dto';

@ApiTags('Project-Owner')
@ApiBearerAuth('bearer')
@Roles(Role.PROJECT)
@Controller('project-owner')
export class ProjectOwnerController {
  constructor(private readonly service: ProjectOwnerService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Public()
  @Roles()
  @Get('projects/public')
  findActiveProjects() {
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

  // ─── Projects ─────────────────────────────────────────────────────────────

  @Get('projects')
  getProjects(@Req() req: any) {
    return this.service.getProjects(req.user.sub);
  }

  @Post('projects')
  createProject(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.service.createProject(req.user.sub, dto);
  }

  @Patch('projects/:id')
  updateProject(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.updateProject(req.user.sub, id, dto);
  }

  @Patch('projects/:id/sustainability')
  updateProjectSustainability(@Req() req: any, @Param('id') id: string, @Body() dto: ProjectSustainabilityDto) {
    return this.service.updateProjectSustainability(req.user.sub, id, dto);
  }

  @Delete('projects/:id')
  deleteProject(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteProject(req.user.sub, id);
  }

  @Public() @Roles()
  @Get('public/search')
  searchOwners(@Query('q') q: string) {
    return this.service.searchOwners(q ?? '');
  }

  @Public() @Roles()
  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.service.getPublicProfile(userId);
  }
}
