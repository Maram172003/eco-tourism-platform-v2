import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';

@Injectable()
export class CapacityDomainService {
  constructor(
    @InjectRepository(OfferItemSession)
    private readonly sessionRepo: Repository<OfferItemSession>,
    @InjectRepository(OfferItemCapacity)
    private readonly capacityRepo: Repository<OfferItemCapacity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async withTransaction<T>(
    manager: EntityManager | undefined,
    fn: (mgr: EntityManager) => Promise<T>,
  ): Promise<T> {
    if (manager) return fn(manager);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await fn(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkAvailability(
    offerItemId: string,
    date: Date | string | null | undefined,
    quantity: number,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(OfferItemSession)
      : this.sessionRepo;

    const session = date
      ? await repo.findOne({
          where: { offerItem: { id: offerItemId }, date: date as any },
        })
      : null;

    if (session && session.remaining_capacity !== null) {
      return session.remaining_capacity >= quantity;
    }

    if (!session) {
      const capRepo = manager
        ? manager.getRepository(OfferItemCapacity)
        : this.capacityRepo;
      const cap = await capRepo.findOne({
        where: { offerItem: { id: offerItemId } },
      });
      if (cap && cap.remaining_quantity !== null) {
        return cap.remaining_quantity >= quantity;
      }
    }

    return true;
  }

  async reserve(
    offerItemId: string,
    date: Date | string | null | undefined,
    quantity: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.withTransaction(manager, async (mgr) => {
      const repo = mgr.getRepository(OfferItemSession);

      const session = date
        ? await repo
            .createQueryBuilder('session')
            .setLock('pessimistic_write')
            .where('session.offer_item_id = :offerItemId', { offerItemId })
            .andWhere('session.date = :date', { date: date as any })
            .getOne()
        : null;

      if (session && session.remaining_capacity !== null) {
        if (session.remaining_capacity < quantity) {
          const dateStr =
            date instanceof Date
              ? date.toLocaleString()
              : String(date ?? 'N/A');
          throw new Error(
            `Capacité insuffisante pour la session du ${dateStr}`,
          );
        }
        session.remaining_capacity -= quantity;
        if (session.remaining_capacity <= 0) session.status = 'full';
        await repo.save(session);
        return;
      }

      if (!session) {
        const capRepo = mgr.getRepository(OfferItemCapacity);
        const cap = await capRepo
          .createQueryBuilder('cap')
          .setLock('pessimistic_write')
          .where('cap.offer_item_id = :offerItemId', { offerItemId })
          .getOne();
        if (cap && cap.remaining_quantity !== null) {
          if (cap.remaining_quantity < quantity) {
            throw new Error('Stock global insuffisant');
          }
          cap.remaining_quantity -= quantity;
          await capRepo.save(cap);
          return;
        }
      }
    });
  }

  async restore(
    offerItemId: string,
    date: Date | string | null | undefined,
    quantity: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.withTransaction(manager, async (mgr) => {
      const repo = mgr.getRepository(OfferItemSession);

      const session = date
        ? await repo
            .createQueryBuilder('session')
            .setLock('pessimistic_write')
            .where('session.offer_item_id = :offerItemId', { offerItemId })
            .andWhere('session.date = :date', { date: date as any })
            .getOne()
        : null;

      if (session && session.remaining_capacity !== null) {
        session.remaining_capacity += quantity;
        if (
          session.total_capacity &&
          session.remaining_capacity >= session.total_capacity
        ) {
          session.status = 'available';
        }
        await repo.save(session);
        return;
      }

      if (!session) {
        const capRepo = mgr.getRepository(OfferItemCapacity);
        const cap = await capRepo
          .createQueryBuilder('cap')
          .setLock('pessimistic_write')
          .where('cap.offer_item_id = :offerItemId', { offerItemId })
          .getOne();
        if (cap && cap.remaining_quantity !== null) {
          cap.remaining_quantity += quantity;
          await capRepo.save(cap);
          return;
        }
      }
    });
  }
}
