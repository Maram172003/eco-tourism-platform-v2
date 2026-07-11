import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelCart } from './entities/travel-cart.entity';
import { TravelCartItem } from './entities/travel-cart-item.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { TripPlan } from '../trip-plan/entities/trip-plan.entity';
import { TripPlanItem } from '../trip-plan/entities/trip-plan-item.entity';
import {
  CreateCartDto,
  UpdateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  ConvertCartToTripPlanDto,
} from './dto/cart.dto';

@Injectable()
export class TravelCartService {
  constructor(
    @InjectRepository(TravelCart)
    private readonly cartRepo: Repository<TravelCart>,
    @InjectRepository(TravelCartItem)
    private readonly itemRepo: Repository<TravelCartItem>,
    @InjectRepository(OfferItem)
    private readonly offerItemRepo: Repository<OfferItem>,
    @InjectRepository(Circuit)
    private readonly circuitRepo: Repository<Circuit>,
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(TripPlan)
    private readonly tripPlanRepo: Repository<TripPlan>,
    @InjectRepository(TripPlanItem)
    private readonly tripPlanItemRepo: Repository<TripPlanItem>,
  ) {}

  // ─── Cart CRUD ──────────────────────────────────────────

  async getOrCreateActive(userId: string): Promise<TravelCart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } as any, status: 'active' },
      relations: ['items', 'items.offerItem', 'items.circuit', 'items.session'],
      order: { created_at: 'DESC' },
    });

    if (!cart) {
      cart = this.cartRepo.create({
        user: { id: userId } as any,
        title: 'Mon panier',
        status: 'active',
      });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async findById(id: string, userId: string): Promise<TravelCart> {
    const cart = await this.cartRepo.findOne({
      where: { id, user: { id: userId } as any },
      relations: [
        'items',
        'items.offerItem',
        'items.offerItem.offer',
        'items.circuit',
        'items.session',
        'items.offerItem.prices',
        'items.circuit.options',
      ],
    });
    if (!cart) throw new NotFoundException('Panier introuvable');
    return cart;
  }

  async updateCart(
    id: string,
    userId: string,
    dto: UpdateCartDto,
  ): Promise<TravelCart> {
    const cart = await this.findById(id, userId);
    if (dto.title !== undefined) cart.title = dto.title;
    if (dto.description !== undefined)
      cart.description = dto.description ?? null;
    if (dto.start_date !== undefined)
      cart.start_date = dto.start_date ? new Date(dto.start_date) : null;
    if (dto.end_date !== undefined)
      cart.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.participant_count !== undefined)
      cart.participant_count = dto.participant_count ?? null;
    await this.cartRepo.save(cart);
    return this.findById(id, userId);
  }

  async removeCart(id: string, userId: string): Promise<{ message: string }> {
    const cart = await this.findById(id, userId);
    await this.cartRepo.remove(cart);
    return { message: 'Panier supprimé.' };
  }

  // ─── Cart Items ─────────────────────────────────────────

  async addItem(
    cartId: string,
    userId: string,
    dto: AddCartItemDto,
  ): Promise<TravelCartItem> {
    if (!dto.offer_item_id && !dto.circuit_id) {
      throw new BadRequestException(
        'Vous devez fournir offer_item_id ou circuit_id',
      );
    }
    if (dto.offer_item_id && dto.circuit_id) {
      throw new BadRequestException("Un seul type d'élément à la fois");
    }

    const cart = await this.findById(cartId, userId);

    const itemData: Partial<TravelCartItem> = {
      cart: cart,
      quantity: dto.quantity ?? 1,
      selected_date: dto.selected_date ? new Date(dto.selected_date) : null,
      selected_options: dto.selected_options ?? null,
      notes: dto.notes ?? null,
    };

    if (dto.offer_item_id) {
      const offerItem = await this.offerItemRepo.findOne({
        where: { id: dto.offer_item_id },
        relations: ['prices'],
      });
      if (!offerItem) throw new NotFoundException('OfferItem introuvable');

      itemData.offerItem = offerItem;

      if (dto.session_id) {
        const session = await this.sessionRepo.findOne({
          where: { id: dto.session_id },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        if (
          session.remaining_capacity !== null &&
          session.remaining_capacity < (dto.quantity ?? 1)
        ) {
          throw new BadRequestException(
            'Pas assez de places pour cette session',
          );
        }
        itemData.session = session;
        itemData.selected_date = new Date(session.date);
      }

      // Calculer le prix estimé
      if (offerItem.prices?.length) {
        const priceRow =
          offerItem.prices.find((p) => p.is_default) ?? offerItem.prices[0];
        itemData.unit_price = Number(priceRow.price);
        itemData.line_total = itemData.unit_price * (dto.quantity ?? 1);
      }
    } else if (dto.circuit_id) {
      const circuit = await this.circuitRepo.findOne({
        where: { id: dto.circuit_id },
      });
      if (!circuit) throw new NotFoundException('Circuit introuvable');

      itemData.circuit = circuit;
      itemData.unit_price = circuit.base_price
        ? Number(circuit.base_price)
        : null;
      itemData.line_total = itemData.unit_price
        ? itemData.unit_price * (dto.quantity ?? 1)
        : null;
    }

    const item = this.itemRepo.create(itemData);
    const saved = await this.itemRepo.save(item);

    await this.recalculateTotal(cartId);

    return this.itemRepo.findOne({
      where: { id: saved.id },
      relations: ['offerItem', 'circuit', 'session'],
    }) as Promise<TravelCartItem>;
  }

  async updateItem(
    cartId: string,
    itemId: string,
    userId: string,
    dto: UpdateCartItemDto,
  ): Promise<TravelCartItem> {
    await this.findById(cartId, userId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, cart: { id: cartId } as any },
    });
    if (!item)
      throw new NotFoundException('Élément introuvable dans le panier');

    if (dto.session_id !== undefined) {
      if (dto.session_id) {
        const session = await this.sessionRepo.findOne({
          where: { id: dto.session_id },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        item.session = session;
        item.selected_date = new Date(session.date);
      } else {
        item.session = null;
      }
    }
    if (dto.selected_date !== undefined)
      item.selected_date = dto.selected_date
        ? new Date(dto.selected_date)
        : null;
    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
      // Recalculer le line_total
      if (item.unit_price) {
        item.line_total = item.unit_price * dto.quantity;
      }
    }
    if (dto.selected_options !== undefined)
      item.selected_options = dto.selected_options;
    if (dto.notes !== undefined) item.notes = dto.notes;

    await this.itemRepo.save(item);
    await this.recalculateTotal(cartId);

    return this.itemRepo.findOne({
      where: { id: item.id },
      relations: ['offerItem', 'circuit', 'session'],
    }) as Promise<TravelCartItem>;
  }

  async removeItem(
    cartId: string,
    itemId: string,
    userId: string,
  ): Promise<{ message: string }> {
    await this.findById(cartId, userId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, cart: { id: cartId } as any },
    });
    if (!item)
      throw new NotFoundException('Élément introuvable dans le panier');
    await this.itemRepo.remove(item);
    await this.recalculateTotal(cartId);
    return { message: 'Élément supprimé du panier.' };
  }

  // ─── Convert to TripPlan ────────────────────────────────

  async convertToTripPlan(
    cartId: string,
    userId: string,
    dto: ConvertCartToTripPlanDto,
  ): Promise<TripPlan> {
    const cart = await this.findById(cartId, userId);
    if (!cart.items?.length) {
      throw new BadRequestException('Le panier est vide');
    }

    // Determine status: if all items are auto-confirmation → "planning", else "draft"
    const allAuto = cart.items.every((item) => {
      if (item.circuit) return item.circuit.confirmation_mode === 'automatic';
      if (item.offerItem?.offer)
        return item.offerItem.offer.confirmation_mode === 'automatic';
      return true;
    });

    // Use the max quantity across all items as participant count
    const participantCount = Math.max(
      ...cart.items.map((i) => i.quantity ?? 1),
      1,
    );

    const plan = this.tripPlanRepo.create({
      ecoTraveler: { id: userId } as any,
      title: dto.title ?? cart.title,
      description: dto.description ?? cart.description,
      start_date: cart.start_date,
      end_date: cart.end_date,
      status: allAuto ? 'planning' : 'draft',
    });
    const savedPlan = await this.tripPlanRepo.save(plan);

    const planStartDate = cart.start_date ? new Date(cart.start_date) : null;

    let sortOrder = 0;
    for (const cartItem of cart.items) {
      const notes = [
        cartItem.notes,
        participantCount > 1 ? `${participantCount} participants` : null,
      ]
        .filter(Boolean)
        .join(' — ');

      // Auto-assign day_number from session date or circuit start_date
      let dayNumber: number | null = null;
      if (planStartDate) {
        let itemDate: Date | null = null;
        if (cartItem.session?.date) {
          itemDate = new Date(cartItem.session.date);
        } else if (cartItem.circuit?.start_date) {
          itemDate = new Date(cartItem.circuit.start_date);
        }
        if (itemDate) {
          const diffMs = itemDate.getTime() - planStartDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          dayNumber = Math.max(1, diffDays + 1);
        }
      }

      sortOrder++;

      const planItem = this.tripPlanItemRepo.create({
        tripPlan: savedPlan,
        offerItem: cartItem.offerItem
          ? ({ id: cartItem.offerItem.id } as OfferItem)
          : null,
        circuit: cartItem.circuit
          ? ({ id: cartItem.circuit.id } as Circuit)
          : null,
        day_number: dayNumber,
        sort_order: sortOrder,
        notes: notes || null,
      });
      await this.tripPlanItemRepo.save(planItem);
    }

    cart.status = 'converted';
    await this.cartRepo.save(cart);

    return this.tripPlanRepo.findOne({
      where: { id: savedPlan.id },
      relations: ['items', 'items.offerItem', 'items.circuit'],
    }) as Promise<TripPlan>;
  }

  // ─── Calcul du total ────────────────────────────────────

  private async recalculateTotal(cartId: string): Promise<void> {
    const items = await this.itemRepo.find({
      where: { cart: { id: cartId } as any },
    });
    const total = items.reduce(
      (sum, item) => sum + (item.line_total ? Number(item.line_total) : 0),
      0,
    );
    await this.cartRepo.update(cartId, { estimated_total: total || null });
  }
}
