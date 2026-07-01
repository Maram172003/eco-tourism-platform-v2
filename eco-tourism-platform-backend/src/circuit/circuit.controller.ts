import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { CircuitService } from './circuit.service';
import { CreateCircuitDto, UpdateCircuitDto } from './dto/circuit.dto';

@ApiTags('Circuits')
@Controller('circuits')
export class CircuitController {
  constructor(private readonly service: CircuitService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateCircuitDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByProvider(req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCircuitDto) {
    return this.service.update(id, req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.sub);
  }
}
