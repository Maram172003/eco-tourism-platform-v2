import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly repo: Repository<Provider>,
  ) {}

  async create(userId: string, dto: CreateProviderDto) {
    const provider = this.repo.create({ user_id: userId, ...dto });
    return this.repo.save(provider);
  }

  async findByUserId(userId: string) {
    return this.repo.findOne({ where: { user_id: userId } });
  }

  async findById(userId: string) {
    const provider = await this.repo.findOne({ where: { user_id: userId } });
    if (!provider) throw new NotFoundException('Provider introuvable');
    return provider;
  }

  async update(userId: string, dto: UpdateProviderDto) {
    await this.findById(userId);
    await this.repo.update({ user_id: userId }, dto);
    return this.findByUserId(userId);
  }

  async findAll() {
    return this.repo.find();
  }
}
