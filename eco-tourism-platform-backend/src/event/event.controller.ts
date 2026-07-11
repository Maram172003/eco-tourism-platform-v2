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
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@ApiTags('Events')
@Controller('places')
export class EventController {
  constructor(private readonly service: EventService) {}

  @Public()
  @Get(':placeId/events')
  findByPlace(@Param('placeId') placeId: string) {
    return this.service.findByPlace(placeId);
  }

  @Public()
  @Get(':placeId/events/upcoming')
  findUpcoming(@Param('placeId') placeId: string) {
    return this.service.findUpcomingByPlace(placeId);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post(':placeId/events')
  create(
    @Req() req: any,
    @Param('placeId') placeId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.service.create(placeId, req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Patch('events/:eventId')
  update(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.service.update(eventId, req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Delete('events/:eventId')
  remove(@Req() req: any, @Param('eventId') eventId: string) {
    return this.service.remove(eventId, req.user.sub);
  }
}
