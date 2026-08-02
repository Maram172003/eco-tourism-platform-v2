import { Injectable } from '@nestjs/common';
import { Circuit } from '../circuit/entities/circuit.entity';
import { CircuitOption } from '../circuit/entities/circuit-option.entity';

export interface CircuitOptionSelection {
  circuitOption: CircuitOption;
  quantity: number;
}

@Injectable()
export class PricingDomainService {
  calculateCircuitPrice(
    circuit: Circuit,
    participantsCount: number,
    selectedOptions: CircuitOptionSelection[] = [],
  ): { baseTotal: number; optionsTotal: number; finalTotal: number } {
    const baseTotal = Number(circuit.base_price ?? 0) * participantsCount;

    let optionsTotal = 0;
    for (const sel of selectedOptions) {
      const unitPrice = Number(sel.circuitOption.extra_price ?? 0);
      optionsTotal += unitPrice * sel.quantity;
    }

    return {
      baseTotal,
      optionsTotal,
      finalTotal: baseTotal + optionsTotal,
    };
  }
}
