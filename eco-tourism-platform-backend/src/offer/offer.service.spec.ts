import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfferService } from './offer.service';
import { Offer } from './entities/offer.entity';
import { OfferCategory } from './entities/offer-category.entity';
import { OfferItem } from './entities/offer-item.entity';
import { OfferItemPrice } from './entities/offer-item-price.entity';
import { OfferItemCapacity } from './entities/offer-item-capacity.entity';
import { OfferItemAvailabilityRule } from './entities/offer-item-availability-rule.entity';
import { OfferItemSession } from './entities/offer-item-session.entity';
import { Venue } from '../project-owner/entities/project.entity';
import { RedisService } from '../redis/redis.service';

describe('OfferService status transitions', () => {
  let service: OfferService;
  let findOrFailMock: jest.Mock;

  const mockRepo = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  });

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    delByPattern: jest.fn(),
  };

  beforeEach(async () => {
    findOrFailMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        {
          provide: getRepositoryToken(Offer),
          useValue: { ...mockRepo(), findOne: findOrFailMock },
        },
        { provide: getRepositoryToken(OfferCategory), useValue: mockRepo() },
        { provide: getRepositoryToken(OfferItem), useValue: mockRepo() },
        { provide: getRepositoryToken(OfferItemPrice), useValue: mockRepo() },
        {
          provide: getRepositoryToken(OfferItemCapacity),
          useValue: mockRepo(),
        },
        {
          provide: getRepositoryToken(OfferItemAvailabilityRule),
          useValue: mockRepo(),
        },
        { provide: getRepositoryToken(OfferItemSession), useValue: mockRepo() },
        { provide: getRepositoryToken(Venue), useValue: mockRepo() },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  const validTransitions: [string, string][] = [
    ['draft', 'pending'],
    ['draft', 'approved'],
    ['draft', 'archived'],
    ['pending', 'approved'],
    ['pending', 'rejected'],
    ['pending', 'archived'],
    ['approved', 'inactive'],
    ['approved', 'archived'],
    ['inactive', 'approved'],
    ['rejected', 'pending'],
    ['rejected', 'archived'],
  ];

  const invalidTransitions: [string, string][] = [
    ['draft', 'rejected'],
    ['draft', 'inactive'],
    ['pending', 'draft'],
    ['pending', 'inactive'],
    ['approved', 'draft'],
    ['approved', 'pending'],
    ['approved', 'rejected'],
    ['inactive', 'draft'],
    ['inactive', 'pending'],
    ['inactive', 'rejected'],
    ['inactive', 'archived'],
    ['rejected', 'approved'],
    ['rejected', 'draft'],
    ['rejected', 'inactive'],
    ['archived', 'draft'],
    ['archived', 'pending'],
    ['archived', 'approved'],
    ['archived', 'rejected'],
    ['archived', 'inactive'],
  ];

  const allStatuses = [
    'draft',
    'pending',
    'approved',
    'rejected',
    'archived',
    'inactive',
  ];

  describe.each(validTransitions)('%s → %s (valide)', (from, to) => {
    it(`devrait accepter ${from} → ${to}`, async () => {
      findOrFailMock.mockResolvedValue({
        id: 'offer-1',
        author_id: 'user-1',
        status: from,
      });
      const result = { id: 'offer-1', author_id: 'user-1', status: to };
      jest.spyOn(service as any, 'findById').mockResolvedValue(result);

      const output = await service.update('user-1', 'offer-1', { status: to });
      expect(output.status).toBe(to);
    });
  });

  describe.each(invalidTransitions)('%s → %s (invalide)', (from, to) => {
    it(`devrait rejeter ${from} → ${to}`, async () => {
      findOrFailMock.mockResolvedValue({
        id: 'offer-1',
        author_id: 'user-1',
        status: from,
      });

      await expect(
        service.update('user-1', 'offer-1', { status: to }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('même statut', () => {
    it.each(allStatuses)(
      '%s → %s devrait toujours être accepté',
      async (status) => {
        findOrFailMock.mockResolvedValue({
          id: 'offer-1',
          author_id: 'user-1',
          status,
        });
        const result = { id: 'offer-1', author_id: 'user-1', status };
        jest.spyOn(service as any, 'findById').mockResolvedValue(result);

        const output = await service.update('user-1', 'offer-1', { status });
        expect(output.status).toBe(status);
      },
    );
  });

  describe('sans changement de statut', () => {
    it('devrait fonctionner quand aucun statut nest fourni', async () => {
      findOrFailMock.mockResolvedValue({
        id: 'offer-1',
        author_id: 'user-1',
        status: 'rejected',
      });
      const result = {
        id: 'offer-1',
        author_id: 'user-1',
        status: 'rejected',
        title: 'Modifié',
      };
      jest.spyOn(service as any, 'findById').mockResolvedValue(result);

      const output = await service.update('user-1', 'offer-1', {
        title: 'Modifié',
      });
      expect(output.title).toBe('Modifié');
      expect(output.status).toBe('rejected');
    });
  });

  describe('autorisation', () => {
    it('devrait rejeter si author_id ne correspond pas', async () => {
      findOrFailMock.mockResolvedValue({
        id: 'offer-1',
        author_id: 'user-2',
        status: 'draft',
      });

      await expect(
        service.update('user-1', 'offer-1', { status: 'approved' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
