import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderActivity } from './entities/provider-activity.entity';
import { CreateProviderActivityDto, UpdateProviderActivityDto } from './dto/provider-activity.dto';

@Injectable()
export class ProviderActivityService {
  constructor(
    @InjectRepository(ProviderActivity)
    private readonly repo: Repository<ProviderActivity>,
  ) {}

  async create(dto: CreateProviderActivityDto) {
    const activity = this.repo.create(dto);
    return this.repo.save(activity);
  }

  async findById(id: string) {
    const activity = await this.repo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException('ProviderActivity introuvable');
    return activity;
  }

  async findByProviderId(providerId: string) {
    return this.repo.find({ where: { provider_id: providerId } });
  }

  async findByOrganizationId(orgId: string) {
    return this.repo.find({ where: { organization_id: orgId } });
  }

  async update(id: string, dto: UpdateProviderActivityDto) {
    await this.findById(id);
    await this.repo.update({ id }, dto);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repo.delete({ id });
  }

  async findAll() {
    return this.repo.find();
  }
}
