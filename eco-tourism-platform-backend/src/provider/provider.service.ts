import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
import { ProviderMongoService } from './provider-mongo.service';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly repo: Repository<Provider>,
    private readonly mongoService: ProviderMongoService,
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

  async updateQuestionnaireScore(userId: string, scoreQuestionnaire: number) {
    const profile = await this.findProviderOrFail(userId);
    profile.score_questionnaire = scoreQuestionnaire;
    profile.sustainability_score = Math.round(
      scoreQuestionnaire * 0.4 +
        (profile.score_reservations ?? 0) * 0.4 +
        (profile.score_feedbacks ?? 0) * 0.2,
    );
    const saved = await this.repo.save(profile);
    if (profile.sustainability_score >= 80) {
      await this.mongoService.addBadge(
        userId,
        'Propriétaire Ambassadeur AFRATIM',
      );
    }
    return saved;
  }

  private async findProviderOrFail(userId: string) {
    const profile = await this.repo.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException(
        "Profil introuvable. Complétez d'abord votre profil.",
      );
    }
    return profile;
  }
}
