import { ReservationDomainService } from './reservation-domain.service';

describe('ReservationDomainService', () => {
  let service: ReservationDomainService;

  beforeEach(() => {
    service = new ReservationDomainService();
  });

  describe('validateTransition', () => {
    it('autorise pending → expired pour booking', () => {
      expect(service.validateTransition('pending', 'expired', 'booking')).toBe(
        true,
      );
    });

    it('autorise pending → expired pour circuit (aligné sur CircuitService.checkExpiredReservations)', () => {
      expect(service.validateTransition('pending', 'expired', 'circuit')).toBe(
        true,
      );
    });

    it('autorise pending → confirmed/rejected/cancelled pour les deux types', () => {
      for (const type of ['booking', 'circuit'] as const) {
        expect(service.validateTransition('pending', 'confirmed', type)).toBe(
          true,
        );
        expect(service.validateTransition('pending', 'rejected', type)).toBe(
          true,
        );
        expect(service.validateTransition('pending', 'cancelled', type)).toBe(
          true,
        );
      }
    });

    it('autorise confirmed → cancelled/completed pour les deux types', () => {
      for (const type of ['booking', 'circuit'] as const) {
        expect(service.validateTransition('confirmed', 'cancelled', type)).toBe(
          true,
        );
        expect(service.validateTransition('confirmed', 'completed', type)).toBe(
          true,
        );
      }
    });

    it('refuse les transitions hors domaine', () => {
      expect(
        service.validateTransition('confirmed', 'expired', 'booking'),
      ).toBe(false);
      expect(
        service.validateTransition('expired', 'confirmed', 'circuit'),
      ).toBe(false);
      expect(
        service.validateTransition('cancelled', 'pending', 'booking'),
      ).toBe(false);
    });

    it('refuse rejected → draft hors circuit', () => {
      expect(service.validateTransition('rejected', 'draft', 'booking')).toBe(
        false,
      );
      expect(service.validateTransition('rejected', 'draft', 'circuit')).toBe(
        true,
      );
    });
  });

  describe('isExpired / délais', () => {
    it('considère une réservation de plus de 48h comme expirée', () => {
      const old = new Date(Date.now() - 49 * 60 * 60 * 1000);
      expect(service.isExpired(old)).toBe(true);
    });

    it('considère une réservation récente comme non expirée', () => {
      expect(service.isExpired(new Date())).toBe(false);
    });

    it('calcule les jours restants avant une session', () => {
      const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      expect(service.calculateDaysUntil(future)).toBe(3);
    });
  });
});
