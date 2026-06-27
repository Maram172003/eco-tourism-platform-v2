import {
  Body, Controller, Delete, Get, Param, Post, Query, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlaceContributionService } from './place-contribution.service';
import { CreateContributionDto } from './dto/place-contribution.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';

const CONTRIBUTOR_ROLES = [Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT];
const ALL_ROLES = [...CONTRIBUTOR_ROLES, Role.ADMIN];

@ApiTags('Place Contributions')
@Controller()
export class PlaceContributionController {
  constructor(private readonly service: PlaceContributionService) {}

  @ApiBearerAuth('bearer') @Roles(...CONTRIBUTOR_ROLES)
  @Post('places/:publicationId/contributions')
  create(
    @Req() req: any,
    @Param('publicationId') publicationId: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.service.create(publicationId, req.user.sub, req.user.role, dto);
  }

  @Public()
  @Get('places/:publicationId/contributions')
  findByPublication(
    @Param('publicationId') publicationId: string,
    @Query('viewer') viewer?: string,
  ) {
    return this.service.findByPublication(publicationId, viewer);
  }

  @ApiBearerAuth('bearer') @Roles(...CONTRIBUTOR_ROLES)
  @Post('contributions/:id/vote')
  toggleVote(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { imageIndex?: number },
  ) {
    return this.service.toggleVote(id, req.user.sub, body?.imageIndex);
  }

  @ApiBearerAuth('bearer') @Roles(...ALL_ROLES)
  @Delete('contributions/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.sub, req.user.role);
  }
}
