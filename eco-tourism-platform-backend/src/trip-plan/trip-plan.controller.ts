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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { TripPlanService } from './trip-plan.service';
import { CreateTripPlanDto } from './dto/create-trip-plan.dto';
import { UpdateTripPlanDto } from './dto/update-trip-plan.dto';
import { AddTripPlanItemDto, UpdateTripPlanItemDto } from './dto/add-trip-plan-item.dto';
import { BookTripPlanDto } from './dto/book-trip-plan.dto';

@ApiTags('Plans de voyage (TripPlan)')
@ApiBearerAuth('bearer')
@Controller('trip-plans')
export class TripPlanController {
  constructor(private readonly service: TripPlanService) {}

  // ─── TripPlan ────────────────────────────────────────

  @ApiOperation({ summary: 'Créer un plan de voyage (éco-voyageur)' })
  @Roles(Role.ECO_TRAVELER)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateTripPlanDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Mes plans de voyage' })
  @Roles(Role.ECO_TRAVELER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByTraveler(req.user.sub);
  }

  @ApiOperation({ summary: 'Détail d\'un plan de voyage (propriétaire uniquement)' })
  @Roles(Role.ECO_TRAVELER)
  @Get(':id')
  findById(@Req() req: any, @Param('id') id: string) {
    return this.service.findByIdForOwner(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Modifier un plan de voyage' })
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTripPlanDto) {
    return this.service.update(id, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Supprimer un plan de voyage' })
  @Roles(Role.ECO_TRAVELER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.sub);
  }

  // ─── Items ───────────────────────────────────────────

  @ApiOperation({ summary: 'Ajouter une offre au plan' })
  @Roles(Role.ECO_TRAVELER)
  @Post(':id/items')
  addItem(@Req() req: any, @Param('id') id: string, @Body() dto: AddTripPlanItemDto) {
    return this.service.addItem(id, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Modifier un élément du plan' })
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id/items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateTripPlanItemDto,
  ) {
    return this.service.updateItem(id, itemId, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Supprimer un élément du plan' })
  @Roles(Role.ECO_TRAVELER)
  @Delete(':id/items/:itemId')
  removeItem(@Req() req: any, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId, req.user.sub);
  }

  // ─── Booking ─────────────────────────────────────────

  @ApiOperation({
    summary: 'Réserver le plan complet',
    description:
      'Génère une réservation (Booking) pour chaque offre du plan. ' +
      'Chaque prestataire reçoit uniquement les réservations le concernant.',
  })
  @Roles(Role.ECO_TRAVELER)
  @Post(':id/book')
  book(@Req() req: any, @Param('id') id: string, @Body() dto: BookTripPlanDto) {
    return this.service.book(id, req.user.sub, dto);
  }
}
