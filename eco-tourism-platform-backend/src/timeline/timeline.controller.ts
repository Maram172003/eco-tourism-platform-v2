import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { TimelineService } from './timeline.service';
import {
  CreateTimelineEntryDto,
  UpdateTimelineEntryDto,
  BulkSaveTimelineDto,
} from './dto/timeline.dto';

@ApiTags('Timeline')
@Controller('publications')
export class TimelineController {
  constructor(private readonly service: TimelineService) {}

  @Public()
  @Get(':publicationId/timeline')
  findByPublication(@Param('publicationId') publicationId: string) {
    return this.service.findByPublication(publicationId);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post(':publicationId/timeline')
  create(
    @Param('publicationId') publicationId: string,
    @Body() dto: CreateTimelineEntryDto,
  ) {
    return this.service.create(publicationId, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Put(':publicationId/timeline')
  bulkSave(
    @Param('publicationId') publicationId: string,
    @Body() dto: BulkSaveTimelineDto,
  ) {
    return this.service.bulkSave(publicationId, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Patch('timeline/:entryId')
  update(
    @Param('entryId') entryId: string,
    @Body() dto: UpdateTimelineEntryDto,
  ) {
    return this.service.update(entryId, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Delete('timeline/:entryId')
  remove(@Param('entryId') entryId: string) {
    return this.service.remove(entryId);
  }
}
