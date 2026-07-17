import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { CircuitService } from './circuit.service';
import { CreateCircuitDto } from './dto/create-circuit.dto';
import { UpdateCircuitDto } from './dto/update-circuit.dto';
import { CreateCircuitDayDto } from './dto/create-circuit-day.dto';
import { CreateCircuitOptionDto } from './dto/create-circuit-option.dto';
import { CreateCircuitProgramItemDto } from './dto/create-circuit-program-item.dto';
import { ReserveCircuitDto } from './dto/reserve-circuit.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Circuits')
@Controller('circuits')
export class CircuitController {
  constructor(private readonly service: CircuitService) {}

  /**
   * Crée un nouveau circuit (guide ou project owner)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCircuitDto) {
    const isGuide = req.user.role === Role.GUIDE;
    return this.service.create(
      req.user.sub,
      isGuide ? 'guide' : 'provider',
      dto,
    );
  }

  /**
   * Circuits de l'auteur connecté (DOIT être avant :id)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  /**
   * Liste publique des circuits approuvés
   */
  @Public()
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = page
      ? { page: parseInt(page), limit: limit ? parseInt(limit) : 20 }
      : undefined;
    return this.service.findAll(status, region, pagination);
  }

  /**
   * Détail d'un circuit avec jours, programme et options
   */
  @Public()
  @Get(':id')
  findById(@Param('id') id: string, @Req() req?: any) {
    return this.service.findById(id, req?.user);
  }

  /**
   * Modifie un circuit (auteur uniquement)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCircuitDto,
  ) {
    const circuit = await this.service.findById(id, req.user);
    if (circuit.author_id !== req.user.sub) {
      throw new ForbiddenException('Accès refusé');
    }
    const updateData: Record<string, any> = { ...dto };
    if (typeof updateData.start_date === 'string') {
      updateData.start_date = updateData.start_date
        ? new Date(updateData.start_date)
        : null;
    }
    if (typeof updateData.end_date === 'string') {
      updateData.end_date = updateData.end_date
        ? new Date(updateData.end_date)
        : null;
    }
    return this.service.update(id, updateData as Partial<CreateCircuitDto>);
  }

  /**
   * Soumet un circuit pour validation admin (draft → pending)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':id/submit')
  async submitForReview(@Req() req: any, @Param('id') id: string) {
    return this.service.submitForReview(id, req.user.sub);
  }

  /**
   * Supprime un circuit (auteur uniquement)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.service.remove(id, req.user.sub);
    return { message: 'Circuit supprimé' };
  }

  /**
   * Ajoute un jour au circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Post(':circuitId/days')
  addDay(
    @Req() req: any,
    @Param('circuitId') circuitId: string,
    @Body() dto: CreateCircuitDayDto,
  ) {
    return this.service.addDay(circuitId, dto, req.user.sub);
  }

  /**
   * Modifie un jour du circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':circuitId/days/:dayId')
  updateDay(
    @Req() req: any,
    @Param('circuitId') circuitId: string,
    @Param('dayId') dayId: string,
    @Body() dto: CreateCircuitDayDto,
  ) {
    return this.service.updateDay(circuitId, dayId, dto, req.user.sub);
  }

  /**
   * Supprime un jour du circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Delete(':circuitId/days/:dayId')
  removeDay(
    @Req() req: any,
    @Param('circuitId') circuitId: string,
    @Param('dayId') dayId: string,
  ) {
    return this.service.removeDay(circuitId, dayId, req.user.sub);
  }

  /**
   * Ajoute une option au circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Post(':circuitId/options')
  addOption(
    @Req() req: any,
    @Param('circuitId') circuitId: string,
    @Body() dto: CreateCircuitOptionDto,
  ) {
    return this.service.addOption(circuitId, dto, req.user.sub);
  }

  /**
   * Options disponibles pour un circuit
   */
  @Public()
  @Get(':circuitId/options')
  findOptions(@Param('circuitId') circuitId: string) {
    return this.service.findOptions(circuitId);
  }

  /**
   * Ajoute un programme à un jour
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Post(':circuitId/days/:dayId/program')
  addProgramItem(
    @Req() req: any,
    @Param('dayId') dayId: string,
    @Body() dto: CreateCircuitProgramItemDto,
  ) {
    return this.service.addProgramItem(dayId, dto, req.user.sub);
  }

  /**
   * Modifie une activité du programme
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':circuitId/days/:dayId/program/:itemId')
  updateProgramItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: CreateCircuitProgramItemDto,
  ) {
    return this.service.updateProgramItem(itemId, dto, req.user.sub);
  }

  /**
   * Supprime une activité du programme
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Delete(':circuitId/days/:dayId/program/:itemId')
  removeProgramItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.service.removeProgramItem(itemId, req.user.sub);
  }

  /**
   * Réserve un circuit (éco-voyageur)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Post(':circuitId/reserve')
  reserve(
    @Req() req: any,
    @Param('circuitId', new (require('@nestjs/common').ParseUUIDPipe)())
    circuitId: string,
    @Body() dto: ReserveCircuitDto,
  ) {
    return this.service.reserve(req.user.sub, {
      ...dto,
      circuit_id: circuitId,
    });
  }

  /**
   * Confirme une réservation de circuit (provider, mode manuel)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch('reservations/:id/confirm')
  confirmReservation(@Req() req: any, @Param('id') id: string) {
    return this.service.confirmReservation(id, req.user.sub);
  }

  /**
   * Refuser une réservation de circuit (provider)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch('reservations/:id/reject')
  rejectReservation(@Req() req: any, @Param('id') id: string) {
    return this.service.rejectReservation(id, req.user.sub);
  }

  /**
   * Réservations reçues par le provider
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Get('reservations/incoming')
  incomingReservations(@Req() req: any) {
    return this.service.findReservationsByCircuitAuthor(req.user.sub);
  }

  /**
   * Réservations de circuits du voyageur
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Get('reservations/mine')
  myReservations(@Req() req: any) {
    return this.service.findReservationsByUser(req.user.sub);
  }

  /**
   * Modifier une réservation de circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Patch('reservations/:id')
  updateReservation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { participants_count?: number },
  ) {
    return this.service.updateReservation(id, req.user.sub, body);
  }

  /**
   * Annuler une réservation de circuit
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Delete('reservations/:id')
  cancelReservation(@Req() req: any, @Param('id') id: string) {
    return this.service.cancelReservation(id, req.user.sub);
  }

  /**
   * Snapshot figé d'une réservation (lecture seule)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Get('reservations/:id/snapshot')
  async getSnapshot(@Req() req: any, @Param('id') id: string) {
    const snapshot = await this.service.getReservationSnapshot(id);
    if (!snapshot) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException('Snapshot introuvable');
    }
    return snapshot;
  }

  /**
   * Marque les réservations circuit pending > 48h comme expirées (système)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ADMIN)
  @Post('reservations/check-expired')
  checkExpiredCircuits() {
    return this.service.checkExpiredReservations();
  }

  /**
   * Transition confirmed → completed pour les circuits passés (système)
   */
  @ApiBearerAuth('bearer')
  @Roles(Role.ADMIN)
  @Post('reservations/finalize-completed')
  finalizeCompletedCircuits() {
    return this.service.finalizeCompletedReservations();
  }
}
