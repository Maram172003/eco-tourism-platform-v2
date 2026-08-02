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

  async create(dto: CreateOrganizationDto) {
    const org = this.repo.create(dto);
    return this.repo.save(org);
  }

  async findById(id: string) {
    const org = await this.repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization introuvable');
    return org;
  }

  async findByProviderId(providerId: string) {
    return this.repo.findOne({ where: { provider_id: providerId } });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findById(id);
    await this.repo.update({ id }, dto);
    return this.findById(id);
  }

  async findAll() {
    return this.repo.find();
  }
}
