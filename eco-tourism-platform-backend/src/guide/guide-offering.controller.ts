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
import { GuideOfferingService } from './guide-offering.service';
import { ReservationService } from '../reservation/reservation.service';
import { CreateGuideReservationDto } from '../reservation/dto/create-reservation.dto';
import {
  CreateGuideOfferingDto,
  UpdateGuideOfferingDto,
  CreateGuideOfferingAvailabilityRuleDto,
  CreateGuideOfferingBlockDto,
  CreateGuideOfferingPriceDto,
  CreateGuideOfferingSessionDto,
  GenerateSessionsDto,
} from './dto/guide-offering.dto';

@ApiTags('Guide Offerings')
@Controller('guide-offerings')
export class GuideOfferingController {
  constructor(
    private readonly service: GuideOfferingService,
    private readonly reservationService: ReservationService,
  ) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post()
  create(@Req() req: any, @Body() dto: CreateGuideOfferingDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByGuide(req.user.sub);
  }

  @Public()
  @Get()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateGuideOfferingDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/availability')
  addAvailabilityRule(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateGuideOfferingAvailabilityRuleDto,
  ) {
    return this.service.addAvailabilityRule(id, dto, req.user.sub);
  }

  @Public()
  @Get(':id/availability')
  findAvailabilityRules(@Param('id') id: string) {
    return this.service.findAvailabilityRules(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete('availability/:ruleId')
  removeAvailabilityRule(@Req() req: any, @Param('ruleId') ruleId: string) {
    return this.service.removeAvailabilityRule(ruleId, req.user.sub);
  }

  // ─── Sessions ───────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/availability/generate')
  generateSessions(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: GenerateSessionsDto,
  ) {
    return this.service.generateSessions(
      id,
      dto.days_ahead ?? 90,
      req.user.sub,
    );
  }

  @Public()
  @Get(':id/sessions')
  findSessions(@Param('id') id: string) {
    return this.service.findSessions(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/sessions')
  createSession(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateGuideOfferingSessionDto,
  ) {
    return this.service.createSession(id, dto, req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete(':id/sessions/:sessionId')
  removeSession(
    @Req() req: any,
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.service.removeSession(id, sessionId, req.user.sub);
  }

  // ─── Booking ────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Post(':id/sessions/:sessionId/book')
  book(
    @Req() req: any,
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateGuideReservationDto,
  ) {
    dto.guide_offering_id = id;
    dto.guide_offering_session_id = sessionId;
    return this.reservationService.createGuideReservation(req.user.sub, dto);
  }

  // ─── Blocks ─────────────────────────────────────────

  @Public()
  @Get(':id/blocks')
  findBlocks(@Param('id') id: string) {
    return this.service.findBlocks(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/blocks')
  createBlock(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateGuideOfferingBlockDto,
  ) {
    return this.service.createBlock(id, dto, req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete('blocks/:blockId')
  removeBlock(@Req() req: any, @Param('blockId') blockId: string) {
    return this.service.removeBlock(blockId, req.user.sub);
  }

  // ─── Prices ─────────────────────────────────────────

  @Public()
  @Get(':id/prices')
  findPrices(@Param('id') id: string) {
    return this.service.findPrices(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Post(':id/prices')
  createPrice(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateGuideOfferingPriceDto,
  ) {
    return this.service.createPrice(id, dto, req.user.sub);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE)
  @Delete('prices/:priceId')
  removePrice(@Req() req: any, @Param('priceId') priceId: string) {
    return this.service.removePrice(priceId, req.user.sub);
  }
}
