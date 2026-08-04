import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Collaboration')
@ApiBearerAuth('bearer')
@Controller('collaborations')
export class CollaborationController {
  constructor(private readonly service: CollaborationService) {}

  /* ── Bidirectionnel : provider OU guide invite (guide OU provider) ── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Post()
  @ApiOperation({ summary: 'Inviter un collaborateur (guide ou provider)' })
  create(@Req() req: any, @Body() dto: CreateCollaborationDto) {
    return this.service.create(req.user.sub, dto);
  }

  /* ── Invité : répondre à l'invitation ─────────────────────── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':id/respond')
  @ApiOperation({ summary: 'Accepter ou refuser une invitation' })
  respond(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: { accept: boolean; decline_reason?: string },
  ) {
    return this.service.respond(
      id,
      req.user.sub,
      body.accept,
      body.decline_reason,
    );
  }

  /* ── Invité : contribution (wizard 8 étapes) ──────────────── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':id/contribution')
  @ApiOperation({
    summary: 'Mettre à jour la contribution (wizard 8 étapes)',
  })
  updateContribution(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateContributionDto,
  ) {
    return this.service.updateContribution(id, req.user.sub, dto);
  }

  /* ── Invité : quitter la collaboration (withdraw) ─────────── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Quitter une collaboration acceptée' })
  withdraw(@Param('id') id: string, @Req() req: any) {
    return this.service.withdrawContribution(req.user.sub, id);
  }

  /* ── Invité : quitter via suppression du créneau agenda ───── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Patch('leave')
  @ApiOperation({ summary: 'Quitter une collaboration en supprimant le créneau [Collab]' })
  leaveBySlot(@Req() req: any, @Body() body: { slot_label: string }) {
    return this.service.leaveCollabBySlotLabel(req.user.sub, body.slot_label);
  }

  /* ── Invité / Auteur : supprimer la collaboration ─────────── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Delete(':id/dismiss')
  @ApiOperation({ summary: 'Supprimer une collaboration (pending/declined pour l\'invité, tout pour l\'auteur)' })
  dismiss(@Param('id') id: string, @Req() req: any) {
    return this.service.dismissCollaboration(req.user.sub, id);
  }

  /* ── Inviteur : annuler l'invitation ──────────────────────── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une invitation' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.service.cancel(id, req.user.sub);
  }

  /* ── Inviteur : retirer un collaborateur (kick) ───────────── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Patch(':id/kick')
  @ApiOperation({ summary: 'Retirer un collaborateur actif' })
  kick(@Param('id') id: string, @Req() req: any) {
    return this.service.kick(id, req.user.sub);
  }

  /* ── Recherche de collaborateurs (guides + prestataires) ──── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Get('collaborators/search')
  @ApiOperation({ summary: 'Rechercher des collaborateurs (guides + prestataires)' })
  searchCollaborators(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('section') section?: string,
    @Query('mode') mode?: string,
  ) {
    return this.service.searchCollaborators(
      q ?? '',
      req.user.sub,
      section,
      mode,
    );
  }

  /* ── Provider: list my collaborations ─────────────────────── */
  @Roles(Role.PROVIDER)
  @Get('provider')
  @ApiOperation({ summary: 'Collaborations en tant que prestataire' })
  findByProvider(@Req() req: any) {
    return this.service.findByProvider(req.user.sub);
  }

  /* ── Guide: list my invitations ───────────────────────────── */
  @Roles(Role.GUIDE)
  @Get('guide')
  @ApiOperation({ summary: 'Mes invitations de collaboration' })
  findByGuide(@Req() req: any) {
    return this.service.findByGuide(req.user.sub);
  }

  /* ── Provider: stats ──────────────────────────────────────── */
  @Roles(Role.PROVIDER)
  @Get('provider/stats')
  @ApiOperation({ summary: 'Statistiques des collaborations' })
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.sub);
  }

  /* ── Get collaboration by offer ───────────────────────────── */
  @Roles(Role.PROVIDER, Role.GUIDE, Role.ADMIN)
  @Get('offer/:offerId')
  @ApiOperation({ summary: "Collaborations d'une offre" })
  findByOffer(@Param('offerId') offerId: string) {
    return this.service.findByOffer(offerId);
  }

  /* ── Offre détaillée pour un collaborateur (author ou invité) */
  @Roles(Role.PROVIDER, Role.GUIDE, Role.ADMIN)
  @Get('offer/:offerId/detail')
  @ApiOperation({ summary: "Détail d'une offre pour un collaborateur (sans les retirés)" })
  getOfferDetail(
    @Param('offerId') offerId: string,
    @Req() req: any,
  ) {
    return this.service.getOfferForCollaborator(req.user.sub, offerId);
  }

  /* ── Agenda : mes créneaux ────────────────────────────────── */
  @Roles(Role.GUIDE, Role.PROVIDER)
  @Get('availability')
  @ApiOperation({ summary: 'Mes créneaux d\'agenda' })
  getAvailability(@Req() req: any) {
    return this.service.getAvailability(req.user.sub);
  }

  @Roles(Role.GUIDE, Role.PROVIDER)
  @Post('availability')
  @ApiOperation({ summary: 'Ajouter un créneau d\'agenda' })
  saveAvailabilitySlot(@Req() req: any, @Body() dto: any) {
    return this.service.saveAvailabilitySlot(req.user.sub, dto);
  }

  @Roles(Role.GUIDE, Role.PROVIDER)
  @Delete('availability/:id')
  @ApiOperation({ summary: 'Supprimer un créneau d\'agenda' })
  deleteAvailabilitySlot(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteAvailabilitySlot(req.user.sub, id);
  }

  /* ── Get one collaboration ────────────────────────────────── */
  @Roles(Role.PROVIDER, Role.GUIDE, Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une collaboration' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /* ── Provider: confirm publication (attente_publication) ──── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Post('offer/:offerId/publish')
  @ApiOperation({ summary: 'Confirmer la publication d\'une offre après collaborations' })
  confirmPublish(
    @Param('offerId') offerId: string,
    @Req() req: any,
    @Body() body: { final_price?: number },
  ) {
    return this.service.confirmPublish(
      offerId,
      req.user.sub,
      body.final_price,
    );
  }

  /* ── Author: publish final (attente_publication → approved) ─ */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Post('offer/:offerId/publish-final')
  @ApiOperation({ summary: 'Publier définitivement l\'offre (approved)' })
  publishFinal(@Param('offerId') offerId: string, @Req() req: any) {
    return this.service.publishOffer(offerId, req.user.sub);
  }

  /* ── Provider: update offer price ─────────────────────────── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Patch('offer/:offerId/price')
  @ApiOperation({ summary: 'Modifier le prix d\'une offre (après collaboration)' })
  updateOfferPrice(
    @Param('offerId') offerId: string,
    @Req() req: any,
    @Body() body: { price: number },
  ) {
    return this.service.updateOfferPrice(
      offerId,
      req.user.sub,
      body.price,
    );
  }

  /* ── Provider: adjust a guide's applied price (margin) ────── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Patch(':id/applied-price')
  @ApiOperation({ summary: "Ajuster le prix appliqué d'un guide (marge)" })
  updateAppliedPrice(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { applied_price: number },
  ) {
    return this.service.updateAppliedPrice(
      id,
      req.user.sub,
      body.applied_price,
    );
  }

  /* ── Provider: get offer collab status ────────────────────── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Get('offer/:offerId/status')
  @ApiOperation({ summary: 'Statut des collaborations d\'une offre' })
  getOfferCollabStatus(@Param('offerId') offerId: string) {
    return this.service.getOfferCollabStatus(offerId);
  }

  /* ── Agenda : conflits potentiels avec une disponibilité ──── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Post('offer/:offerId/collab-conflicts')
  @ApiOperation({ summary: 'Vérifier les conflits d\'agenda d\'une disponibilité' })
  checkCollabConflicts(
    @Param('offerId') offerId: string,
    @Body('disponibilite') disponibilite: any,
  ) {
    return this.service.checkCollabConflicts(offerId, disponibilite);
  }

  /* ── Agenda : sync la disponibilité d'une offre possédée ──── */
  @Roles(Role.PROVIDER, Role.GUIDE)
  @Patch('offer/:offerId/availability')
  @ApiOperation({ summary: 'Synchroniser l\'agenda avec la disponibilité d\'une offre' })
  updateOfferAvailability(
    @Param('offerId') offerId: string,
    @Req() req: any,
    @Body('disponibilite') disponibilite: any,
  ) {
    return this.service.updateOfferAvailability(
      req.user.sub,
      offerId,
      disponibilite,
    );
  }
}
