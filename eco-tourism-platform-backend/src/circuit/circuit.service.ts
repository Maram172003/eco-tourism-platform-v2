import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circuit } from './entities/circuit.entity';
import { CreateCircuitDto, UpdateCircuitDto } from './dto/circuit.dto';

@Injectable()
export class CircuitService {
  constructor(
    @InjectRepository(Circuit)
    private readonly repo: Repository<Circuit>,
  ) {}

  async create(providerId: string, dto: CreateCircuitDto): Promise<Circuit> {
    const circuit = this.repo.create({
      provider_id: providerId,
      title: dto.title,
      description: dto.description ?? null,
      nb_jours: dto.nb_jours,
      cover_image: dto.cover_image ?? null,
      etapes: dto.etapes ?? [],
      availability: dto.availability ?? null,
      hebergement: dto.hebergement ?? null,
    });
    return this.repo.save(circuit);
  }

  async findByProvider(providerId: string): Promise<Circuit[]> {
    return this.repo.find({
      where: { provider_id: providerId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Circuit> {
    const circuit = await this.repo.findOne({ where: { id } });
    if (!circuit) throw new NotFoundException('Circuit introuvable.');
    return circuit;
  }

  async update(id: string, providerId: string, dto: UpdateCircuitDto): Promise<Circuit> {
    const circuit = await this.findOne(id);
    if (circuit.provider_id !== providerId) throw new ForbiddenException();
    Object.assign(circuit, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.nb_jours !== undefined && { nb_jours: dto.nb_jours }),
      ...(dto.cover_image !== undefined && { cover_image: dto.cover_image }),
      ...(dto.etapes !== undefined && { etapes: dto.etapes }),
      ...(dto.availability !== undefined && { availability: dto.availability }),
      ...(dto.hebergement !== undefined && { hebergement: dto.hebergement }),
    });
    return this.repo.save(circuit);
  }

  async remove(id: string, providerId: string): Promise<void> {
    const circuit = await this.findOne(id);
    if (circuit.provider_id !== providerId) throw new ForbiddenException();
    await this.repo.remove(circuit);
  }
}
