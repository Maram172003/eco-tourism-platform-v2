import { Injectable } from '@nestjs/common';

export type ReservationType = 'booking' | 'circuit';

export const RESERVATION_TRANSITIONS: Record<
  string,
  Record<string, ReservationType[]>
> = {
  pending: {
    confirmed: ['booking', 'circuit'],
    rejected: ['booking', 'circuit'],
    cancelled: ['booking', 'circuit'],
    expired: ['booking'],
  },
  confirmed: {
    cancelled: ['booking', 'circuit'],
    completed: ['booking', 'circuit'],
  },
  rejected: { draft: ['circuit'] },
  cancelled: {},
  expired: {},
  completed: {},
};

@Injectable()
export class ReservationDomainService {
  validateTransition(
    currentStatus: string,
    nextStatus: string,
    type: ReservationType,
  ): boolean {
    if (currentStatus === nextStatus) return true;
    const allowed = RESERVATION_TRANSITIONS[currentStatus]?.[nextStatus];
    return allowed?.includes(type) ?? false;
  }

  isExpired(createdAt: Date, expirationHours = 48): boolean {
    const cutoff = new Date(Date.now() - expirationHours * 60 * 60 * 1000);
    return createdAt < cutoff;
  }

  isSessionPast(sessionDate: Date): boolean {
    return new Date(sessionDate) < new Date();
  }

  calculateDaysUntil(sessionDate: Date): number {
    const now = new Date();
    return Math.ceil(
      (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  isWithinDeadline(daysUntilSession: number, deadlineDays: number): boolean {
    return daysUntilSession >= deadlineDays;
  }

  validateCancellationDeadline(
    sessionDate: Date,
    deadlineDays: number,
  ): { allowed: boolean; daysUntil: number } {
    const daysUntil = this.calculateDaysUntil(sessionDate);
    return {
      allowed: this.isWithinDeadline(daysUntil, deadlineDays),
      daysUntil,
    };
  }

  validateBookingDeadline(
    sessionDate: Date,
    deadlineDays: number,
  ): { allowed: boolean; daysUntil: number } {
    const daysUntil = this.calculateDaysUntil(sessionDate);
    return {
      allowed: this.isWithinDeadline(daysUntil, deadlineDays),
      daysUntil,
    };
  }
}
