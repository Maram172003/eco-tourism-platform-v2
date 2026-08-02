import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/roles.enum';
import { CertificationService } from './certification.service';
import { CreateCertificationDto, UpdateCertificationStatusDto } from './dto/certification.dto';

@ApiTags('Certifications')
@Controller('certifications')
export class CertificationController {
  constructor(private readonly service: CertificationService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Get()
  findMine(@Req() req: any) {
    return this.service.findByUser(req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Post()
  create(@Req() req: any, @Body() dto: CreateCertificationDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCertificationDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ADMIN)
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('user/:userId')
  findApprovedByUser(@Param('userId') userId: string) {
    return this.service.findApprovedByUser(userId);
  }

  // ─── Admin ──────────────────────────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.ADMIN)
  @Get('pending')
  findPending() {
    return this.service.findPending();
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCertificationStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
