import { Controller, Get, Patch, Req, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ProviderService } from './provider.service';
import { UpdateProviderDto } from './dto/provider.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Providers')
@Controller('providers')
export class ProviderController {
  constructor(private readonly service: ProviderService) {}

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
