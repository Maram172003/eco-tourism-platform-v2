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
import { TravelCartService } from './travel-cart.service';
import {
  CreateCartDto,
  UpdateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  ConvertCartToTripPlanDto,
} from './dto/cart.dto';

@ApiTags('Panier de voyage (Travel Cart)')
@ApiBearerAuth('bearer')
@Controller('travel-carts')
export class TravelCartController {
  constructor(private readonly service: TravelCartService) {}

  // ─── Cart ───────────────────────────────────────────────

  @ApiOperation({ summary: 'Récupérer ou créer le panier actif' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Get('me')
  getMyCart(@Req() req: any) {
    return this.service.getOrCreateActive(req.user.sub);
  }

  @ApiOperation({ summary: 'Détail du panier' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Get(':id')
  findById(@Req() req: any, @Param('id') id: string) {
    return this.service.findById(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Modifier le panier' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Patch(':id')
  updateCart(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.service.updateCart(id, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Supprimer le panier' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Delete(':id')
  removeCart(@Req() req: any, @Param('id') id: string) {
    return this.service.removeCart(id, req.user.sub);
  }

  // ─── Cart Items ─────────────────────────────────────────

  @ApiOperation({
    summary: 'Ajouter un élément au panier (OfferItem ou Circuit)',
  })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Post(':id/items')
  addItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.service.addItem(id, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Modifier un élément du panier' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Patch(':id/items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.service.updateItem(id, itemId, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Supprimer un élément du panier' })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Delete(':id/items/:itemId')
  removeItem(
    @Req() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeItem(id, itemId, req.user.sub);
  }

  // ─── Convert ────────────────────────────────────────────

  @ApiOperation({
    summary: 'Convertir le panier en Trip Plan',
    description:
      'Transforme le panier temporaire en plan de voyage structuré et valide.',
  })
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Post(':id/convert')
  convertToTripPlan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConvertCartToTripPlanDto,
  ) {
    return this.service.convertToTripPlan(id, req.user.sub, dto);
  }
}
