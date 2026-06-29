import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Réservations')
@Controller('bookings')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  /**
   * Crée une réservation (éco-voyageur)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user.sub, dto);
  }

  /**
   * Liste des réservations du voyageur connecté
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByTraveler(req.user.sub);
  }

  /**
   * Réservations reçues par le provider connecté
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Get('incoming')
  incoming(@Req() req: any) {
    return this.service.findByOfferAuthor(req.user.sub);
  }

  /**
   * Détail d'une réservation (propriétaire ou provider uniquement)
   */
  @ApiBearerAuth('bearer')
  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string) {
    const booking = await this.service.findById(id);
    const userId = req.user.sub;
    const isTraveler = booking.traveler.id === userId;
    const isProvider = booking.offer?.author_id === userId;
    if (!isTraveler && !isProvider && req.user.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres réservations');
    }
    return booking;
  }

  /**
   * Annulation par le voyageur
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.cancel(id, req.user.sub, reason);
  }

  /**
   * Confirmation par le provider (mode manuel)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROJECT)
  @Patch(':id/confirm')
  confirm(@Req() req: any, @Param('id') id: string) {
    return this.service.confirm(id, req.user.sub);
  }

  /**
   * Ajouter des participants à une réservation existante
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id/participants')
  addParticipants(@Req() req: any, @Param('id') id: string, @Body() dto: AddParticipantsDto) {
    return this.service.addParticipants(id, req.user.sub, dto.participants);
  }
}
