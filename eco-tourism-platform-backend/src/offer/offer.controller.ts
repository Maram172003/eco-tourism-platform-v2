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
import { OfferService } from './offer.service';
import {
  CreateOfferDto,
  OfferSustainabilityDto,
  UpdateOfferDto,
  CreateOfferItemDto,
  UpdateOfferItemDto,
  CreateOfferItemPriceDto,
  UpdateOfferItemPriceDto,
  CreateAvailabilityRuleDto,
  CreateOfferItemSessionDto,
  UpdateOfferItemSessionDto,
} from './dto/offer.dto';
import { Public } from '../common/decorators/public.decorator';
import { ProviderMongoService } from '../provider/provider-mongo.service';

const PROJECT_AMBASSADOR_BADGE = 'Propriétaire Ambassadeur AFRATIM';

@ApiTags('Offers')
@Controller('offers')
export class OfferController {
  constructor(
    private readonly service: OfferService,
    private readonly providerMongoService: ProviderMongoService,
  ) {}

  // ─── Offer ─────────────────────────────────────────

  /** Project Owner crée une offre (les guides utilisent guide-offerings) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateOfferDto) {
    const userId = req.user.sub;
    const mongoService = this.providerMongoService;
    const hasAmbassador = await mongoService.hasBadge(
      userId,
      PROJECT_AMBASSADOR_BADGE,
    );
    return this.service.create(
      userId,
      'provider',
      dto,
      hasAmbassador ? 'approved' : 'pending',
    );
  }

  /** Mes propres offres (dashboard) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  /** Mes propres items d'offres */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get('items/mine')
  findMyItems(@Req() req: any) {
    return this.service.findMyItems(req.user.sub);
  }

  /** Toutes les offres approuvées (page Destinations) */
  @Public()
  @Get()
  findAllPublic(
    @Query('region') region?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = page
      ? { page: parseInt(page), limit: limit ? parseInt(limit) : 20 }
      : undefined;
    return this.service.findAllPublic(region, pagination);
  }

  /** Offres publiées d'un auteur (page profil) */
  @Public()
  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.service.findPublishedByAuthor(authorId);
  }

  /** Offres d'un établissement spécifique */
  @Public()
  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.service.findByVenue(venueId);
  }

  /** Recherche publique d'offres filtrée par catégorie, géolocalisation (pour services externes circuits) */
  @Public()
  @Get('public')
  async findPublic(
    @Query('category') category?: string,
    @Query('exclude_author') excludeAuthor?: string,
    @Query('region') region?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius_km') radiusKm?: string,
    @Query('item_type') itemType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = page
      ? { page: parseInt(page), limit: limit ? parseInt(limit) : 20 }
      : undefined;
    return this.service.findPublic(
      category,
      excludeAuthor,
      region,
      {
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radiusKm: radiusKm ? Number(radiusKm) : undefined,
        itemType,
      },
      pagination,
    );
  }

  /** Lieux populaires pour la heatmap */
  @Public()
  @Get('popular-locations')
  getPopularLocations() {
    return this.service.getPopularLocations();
  }

  /** Détail d'une offre (public) */
  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** Score de durabilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id/sustainability')
  updateSustainability(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: OfferSustainabilityDto,
  ) {
    return this.service.updateOfferSustainability(req.user.sub, id, dto);
  }

  /** Modifier une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  /** Supprimer une offre (soft delete si réservations actives) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  /** Archiver une offre (masquer définitivement) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id/archive')
  archive(@Req() req: any, @Param('id') id: string) {
    return this.service.archive(req.user.sub, id);
  }

  /** Désactiver une offre (masquer temporairement) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id/deactivate')
  deactivate(@Req() req: any, @Param('id') id: string) {
    return this.service.deactivate(req.user.sub, id);
  }

  /** Réactiver une offre désactivée */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch(':id/reactivate')
  reactivate(@Req() req: any, @Param('id') id: string) {
    return this.service.reactivate(req.user.sub, id);
  }

  /** Voir les circuits liés à une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Get(':id/linked-circuits')
  linkedCircuits(@Param('id') id: string) {
    return this.service.findLinkedCircuits(id);
  }

  // ─── OfferItems ────────────────────────────────────

  /** Liste des items d'une offre (public) */
  @Public()
  @Get(':offerId/items')
  findItems(@Param('offerId') offerId: string) {
    return this.service.findItems(offerId);
  }

  /** Crée un item (variante) pour une offre */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post(':offerId/items')
  createItem(
    @Req() req: any,
    @Param('offerId') offerId: string,
    @Body() dto: CreateOfferItemDto,
  ) {
    return this.service.createItem(offerId, dto, req.user.sub);
  }

  /** Détail d'un item */
  @Public()
  @Get('items/:itemId')
  findItemById(@Param('itemId') itemId: string) {
    return this.service.findItemById(itemId);
  }

  /** Modifier un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOfferItemDto,
  ) {
    return this.service.updateItem(itemId, dto, req.user.sub);
  }

  /** Supprimer un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('items/:itemId')
  removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.service.removeItem(itemId, req.user.sub);
  }

  // ─── OfferItem Prices ──────────────────────────────

  /** Ajoute un prix à un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('items/:itemId/prices')
  addPrice(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: CreateOfferItemPriceDto,
  ) {
    return this.service.addPrice(itemId, dto, req.user.sub);
  }

  /** Modifier un prix */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('items/prices/:priceId')
  updatePrice(
    @Req() req: any,
    @Param('priceId') priceId: string,
    @Body() dto: UpdateOfferItemPriceDto,
  ) {
    return this.service.updatePrice(priceId, dto, req.user.sub);
  }

  /** Supprimer un prix */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('items/prices/:priceId')
  removePrice(@Req() req: any, @Param('priceId') priceId: string) {
    return this.service.removePrice(priceId, req.user.sub);
  }

  // ─── Availability Rules ────────────────────────────

  /** Ajoute une règle de disponibilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('items/:itemId/availability')
  addAvailabilityRule(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: CreateAvailabilityRuleDto,
  ) {
    return this.service.addAvailabilityRule(itemId, dto, req.user.sub);
  }

  /** Liste les règles de disponibilité */
  @Public()
  @Get('items/:itemId/availability')
  findAvailabilityRules(@Param('itemId') itemId: string) {
    return this.service.findAvailabilityRules(itemId);
  }

  /** Supprime une règle de disponibilité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('availability/:ruleId')
  removeAvailabilityRule(@Req() req: any, @Param('ruleId') ruleId: string) {
    return this.service.removeAvailabilityRule(ruleId, req.user.sub);
  }

  /** Supprime toutes les règles de disponibilité d'un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('items/:itemId/availability/delete-all')
  removeAllAvailabilityRules(@Req() req: any, @Param('itemId') itemId: string) {
    return this.service.removeAllAvailabilityRules(itemId, req.user.sub);
  }

  /** Génère les sessions automatiquement depuis les règles */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('items/:itemId/availability/generate')
  generateSessions(@Req() req: any, @Param('itemId') itemId: string) {
    return this.service.generateSessions(itemId, 90, req.user.sub);
  }

  // ─── Capacity ──────────────────────────────────────

  /** Définit la capacité d'un item */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('items/:itemId/capacity')
  setCapacity(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: { capacity_type: string; total_quantity: number },
  ) {
    return this.service.setCapacity(itemId, dto, req.user.sub);
  }

  /** Récupère la capacité d'un item */
  @Public()
  @Get('items/:itemId/capacity')
  getCapacity(@Param('itemId') itemId: string) {
    return this.service.getCapacity(itemId);
  }

  /** Supprime la capacité */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('capacity/:capacityId')
  removeCapacity(@Req() req: any, @Param('capacityId') capacityId: string) {
    return this.service.removeCapacity(capacityId, req.user.sub);
  }

  // ─── Sessions ──────────────────────────────────────

  /** Crée une session (créneau concret) */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Post('items/:itemId/sessions')
  createSession(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: CreateOfferItemSessionDto,
  ) {
    return this.service.createSession(itemId, dto, req.user.sub);
  }

  /** Modifier une session */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Patch('items/sessions/:sessionId')
  updateSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateOfferItemSessionDto,
  ) {
    return this.service.updateSession(sessionId, dto, req.user.sub);
  }

  /** Supprimer une session */
  @ApiBearerAuth('bearer')
  @Roles(Role.PROVIDER)
  @Delete('items/sessions/:sessionId')
  removeSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.service.removeSession(sessionId, req.user.sub);
  }

  /** Sessions disponibles pour un item */
  @Public()
  @Get('items/:itemId/sessions')
  findSessions(@Param('itemId') itemId: string) {
    return this.service.findSessions(itemId);
  }
}
