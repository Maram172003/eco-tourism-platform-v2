import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  async findByProvider(providerId: string): Promise<Organization | null> {
    return this.repo.findOne({ where: { provider_id: providerId } });
  }

  async getMyOrganization(providerId: string): Promise<Organization | null> {
    return this.findByProvider(providerId);
  }

  async create(providerId: string, dto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.findByProvider(providerId);
    if (existing) {
      // Si déjà créée, on met à jour
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    const org = this.repo.create({ ...dto, provider_id: providerId, status: 'pending' });
    return this.repo.save(org);
  }

  async update(providerId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findByProvider(providerId);
    if (!org) throw new NotFoundException('Organisation introuvable.');
    Object.assign(org, dto);
    return this.repo.save(org);
  }

  async getPublic(orgId: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organisation introuvable.');
    return org;
  }

  async getPublicByProvider(providerId: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { provider_id: providerId } });
    if (!org) throw new NotFoundException('Organisation introuvable.');
    return org;
  }

  async approve(orgId: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organisation introuvable.');
    org.status = 'active';
    return this.repo.save(org);
  }
}
