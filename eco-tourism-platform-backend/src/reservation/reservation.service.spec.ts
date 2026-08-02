import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { ReservationParticipant } from './entities/reservation-participant.entity';
import { OfferItemSession } from '../offer/entities/offer-item-session.entity';
import { Offer } from '../offer/entities/offer.entity';
import { OfferItem } from '../offer/entities/offer-item.entity';
import { OfferItemCapacity } from '../offer/entities/offer-item-capacity.entity';
import { GuideOffering } from '../guide/entities/guide-offering.entity';
import { GuideOfferingSession } from '../guide/entities/guide-offering-session.entity';
import { NotificationService } from '../notification/notification.service';
import { CapacityDomainService } from '../domain/capacity-domain.service';
import { ReservationDomainService } from '../domain/reservation-domain.service';
import { EcoTravelerService } from '../eco-traveler/eco-traveler.service';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  const mockCapacityService = {
    checkAvailability: jest.fn().mockResolvedValue(true),
    reserve: jest.fn(),
    restore: jest.fn(),
  };

  const mockReservationDomain = {
    validateTransition: jest.fn().mockReturnValue(true),
  };

  const mockEcoTravelerService = {
    recomputeReservationsScore: jest.fn(),
    recomputeFeedbacksScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: getRepositoryToken(Reservation), useValue: mockRepo },
        {
          provide: getRepositoryToken(ReservationParticipant),
          useValue: mockRepo,
        },
        { provide: getRepositoryToken(OfferItemSession), useValue: mockRepo },
        { provide: getRepositoryToken(Offer), useValue: mockRepo },
        { provide: getRepositoryToken(OfferItem), useValue: mockRepo },
        { provide: getRepositoryToken(OfferItemCapacity), useValue: mockRepo },
        { provide: getRepositoryToken(GuideOffering), useValue: mockRepo },
        {
          provide: getRepositoryToken(GuideOfferingSession),
          useValue: mockRepo,
        },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: CapacityDomainService, useValue: mockCapacityService },
        { provide: ReservationDomainService, useValue: mockReservationDomain },
        { provide: EcoTravelerService, useValue: mockEcoTravelerService },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should throw NotFoundException if reservation not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        'Réservation introuvable',
      );
    });

    it('should return reservation if found', async () => {
      const mockReservation = { id: 'test-id', status: 'confirmed' };
      mockRepo.findOne.mockResolvedValue(mockReservation);
      const result = await service.findById('test-id');
      expect(result).toEqual(mockReservation);
    });
  });

  describe('findByTraveler', () => {
    it('should return reservations for a traveler', async () => {
      const mockReservations = [{ id: '1', traveler: { id: 'user-1' } }];
      mockRepo.find.mockResolvedValue(mockReservations);
      const result = await service.findByTraveler('user-1');
      expect(result).toEqual(mockReservations);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { traveler: { id: 'user-1' } },
        relations: [
          'offer',
          'offerItem',
          'session',
          'guideOffering',
          'guideOfferingSession',
          'participants',
        ],
        order: { created_at: 'DESC' },
      });
    });
  });
});
