import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TravelCart } from './travel-cart.entity';
import { OfferItem } from '../../offer/entities/offer-item.entity';
import { Circuit } from '../../circuit/entities/circuit.entity';
import { OfferItemSession } from '../../offer/entities/offer-item-session.entity';

/**
 * Élément du panier de voyage
 * Chaque élément référence soit un OfferItem soit un Circuit (XOR)
 *
 * Peut inclure :
 * - La session/créneau sélectionné (pour les activités)
 * - La date choisie
 * - Les options supplémentaires (pour les circuits)
 * - La quantité (nombre de personnes ou d'unités)
 */
@Entity('travel_cart_items')
export class TravelCartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TravelCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: TravelCart;

  // ═══════ Référence soit OfferItem soit Circuit ═══════

  @ManyToOne(() => OfferItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'offer_item_id' })
  offerItem!: OfferItem | null;

  @ManyToOne(() => Circuit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'circuit_id' })
  circuit!: Circuit | null;

  // ═══════ Session sélectionnée (pour OfferItem) ═══════

  @ManyToOne(() => OfferItemSession, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session!: OfferItemSession | null;

  // ═══════ Date et quantité ═══════

  @Column({ type: 'date', nullable: true })
  selected_date!: Date | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;
  // Nombre de personnes (pour activité) ou d'unités (pour équipement)

  // ═══════ Options circuit ═══════

  @Column({ type: 'json', nullable: true })
  selected_options!: Record<string, any> | null;
  // { circuit_option_id: { quantity, session_id } }

  // ═══════ Prix estimé ═══════

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_price!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  line_total!: number | null;

  // ═══════ Notes ═══════

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
