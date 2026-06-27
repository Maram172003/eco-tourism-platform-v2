import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { ReservationService } from './reservation.service';
import { ConfirmReservationDto, CreateReservationDto, RespondToInvitationDto } from './dto/reservation.dto';

@ApiTags('Reservations')
@ApiBearerAuth('bearer')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  // Créer une réservation (solo ou groupe)
  @Roles(Role.ECO_TRAVELER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateReservationDto) {
    return this.service.create(req.user.sub, dto);
  }

  // Mes réservations (organisées + invitations reçues)
  @Roles(Role.ECO_TRAVELER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findMine(req.user.sub);
  }

  // Invitations en attente
  @Roles(Role.ECO_TRAVELER)
  @Get('invitations')
  findPendingInvitations(@Req() req: any) {
    return this.service.findPendingInvitations(req.user.sub);
  }

  // Détail d'une réservation
  @Roles(Role.ECO_TRAVELER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Répondre à une invitation (accepter / refuser)
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id/respond')
  respond(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RespondToInvitationDto,
  ) {
    return this.service.respondToInvitation(req.user.sub, id, dto);
  }

  // Annuler une réservation (organisateur uniquement)
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.service.cancelReservation(req.user.sub, id);
  }

  // Réservations reçues pour les offres du prestataire
  @Roles(Role.PROVIDER)
  @Get('provider/received')
  findForProvider(@Req() req: any) {
    return this.service.findForProvider(req.user.sub);
  }

  // Prestataire confirme ou rejette une réservation
  @Roles(Role.PROVIDER)
  @Patch(':id/confirm')
  confirmByProvider(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmReservationDto,
  ) {
    return this.service.confirmByProvider(req.user.sub, id, dto);
  }
}
