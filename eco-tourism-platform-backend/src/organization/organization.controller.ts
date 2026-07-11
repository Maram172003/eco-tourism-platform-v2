import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/organization.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
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
