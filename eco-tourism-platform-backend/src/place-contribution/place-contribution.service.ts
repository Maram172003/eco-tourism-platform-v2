import {
  BadRequestException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PlaceContribution } from './entities/place-contribution.entity';
import { ContributionVote } from './entities/contribution-vote.entity';
import { Publication } from '../publication/entities/publication.entity';
import { EcoTraveler } from '../eco-traveler/entities/eco-traveler.entity';
import { Guide } from '../guide/entities/guide.entity';
import { ProjectOwner } from '../project-owner/entities/project-owner.entity';
import { CreateContributionDto } from './dto/place-contribution.dto';

@Injectable()
export class PlaceContributionService {
  constructor(
    @InjectRepository(PlaceContribution)
    private readonly contribRepo: Repository<PlaceContribution>,
    @InjectRepository(ContributionVote)
    private readonly voteRepo: Repository<ContributionVote>,
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,
    @InjectRepository(EcoTraveler)
    private readonly ecoRepo: Repository<EcoTraveler>,
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
    @InjectRepository(ProjectOwner)
    private readonly ownerRepo: Repository<ProjectOwner>,
  ) {}

  private async getAuthorInfo(userId: string, role: string) {
    let entity: any = null;
    if (role === 'eco_traveler') entity = await this.ecoRepo.findOne({ where: { user_id: userId } });
    else if (role === 'guide')   entity = await this.guideRepo.findOne({ where: { user_id: userId } });
    else                         entity = await this.ownerRepo.findOne({ where: { user_id: userId } });
    return { user_id: userId, full_name: entity?.full_name ?? 'Utilisateur', photo: entity?.photo ?? null, role };
  }

  async create(publicationId: string, userId: string, userRole: string, dto: CreateContributionDto) {
    const pub = await this.pubRepo.findOne({ where: { id: publicationId, type: 'place', status: 'approved' } });
    if (!pub) throw new NotFoundException('Lieu introuvable ou non approuvé.');

    if (dto.type === 'description' && !dto.content?.trim()) {
      throw new BadRequestException('Le contenu est requis pour une contribution de type description.');
    }
    if (dto.type === 'images' && (!dto.images || dto.images.length === 0)) {
      throw new BadRequestException('Au moins une image est requise.');
    }

    const contrib = this.contribRepo.create({
      publication_id: publicationId,
      user_id: userId,
      user_role: userRole,
      type: dto.type,
      content: dto.type === 'description' ? dto.content : null,
      images: dto.type === 'images' ? dto.images : null,
      vote_count: 0,
    });
    return this.contribRepo.save(contrib);
  }

  async findByPublication(publicationId: string, viewerId?: string) {
    const contributions = await this.contribRepo.find({
      where: { publication_id: publicationId },
      order: { vote_count: 'DESC', created_at: 'ASC' },
    });

    if (!contributions.length) return [];

    const uniqueAuthors = [...new Set(contributions.map((c) => `${c.user_id}:${c.user_role}`))];
    const authorMap = new Map<string, any>();
    for (const key of uniqueAuthors) {
      const [userId, role] = key.split(':');
      authorMap.set(key, await this.getAuthorInfo(userId, role));
    }

    // Fetch ALL votes for all contributions in one query
    const contribIds = contributions.map((c) => c.id);
    const allVotes = await this.voteRepo.find({ where: { contribution_id: In(contribIds) } });

    return contributions.map((c) => {
      const contribVotes = allVotes.filter((v) => v.contribution_id === c.id);

      let userVoted = false;
      let imageVotes: Record<number, { vote_count: number; user_voted: boolean }> | undefined;

      if (c.type === 'images' && c.images) {
        imageVotes = {};
        for (let i = 0; i < c.images.length; i++) {
          const votesForImg = contribVotes.filter((v) => v.image_index === i);
          imageVotes[i] = {
            vote_count: votesForImg.length,
            user_voted: viewerId ? votesForImg.some((v) => v.user_id === viewerId) : false,
          };
        }
        userVoted = viewerId ? contribVotes.some((v) => v.user_id === viewerId) : false;
      } else {
        // Description: votes have image_index = null
        const descVotes = contribVotes.filter((v) => v.image_index === null);
        userVoted = viewerId ? descVotes.some((v) => v.user_id === viewerId) : false;
      }

      return {
        ...c,
        user_voted: userVoted,
        image_votes: imageVotes,
        author: authorMap.get(`${c.user_id}:${c.user_role}`) ?? { user_id: c.user_id, full_name: 'Utilisateur', photo: null, role: c.user_role },
      };
    });
  }

  async toggleVote(contributionId: string, userId: string, imageIndex?: number) {
    const contrib = await this.contribRepo.findOne({ where: { id: contributionId } });
    if (!contrib) throw new NotFoundException('Contribution introuvable.');
    // TODO: restore self-vote block after testing
    // if (contrib.user_id === userId) throw new ForbiddenException('Vous ne pouvez pas voter pour votre propre contribution.');

    const imgIdx = (imageIndex !== undefined && imageIndex >= 0) ? imageIndex : null;

    const existing = await this.voteRepo.findOne({
      where: {
        contribution_id: contributionId,
        user_id: userId,
        image_index: imgIdx !== null ? imgIdx : IsNull(),
      } as any,
    });

    let voted: boolean;
    if (existing) {
      await this.voteRepo.remove(existing);
      voted = false;
    } else {
      await this.voteRepo.save(
        this.voteRepo.create({ contribution_id: contributionId, user_id: userId, image_index: imgIdx }),
      );
      voted = true;
    }

    // Recompute total vote_count as sum of all votes across all images
    const allVotes = await this.voteRepo.find({ where: { contribution_id: contributionId } });
    contrib.vote_count = allVotes.length;
    await this.contribRepo.save(contrib);

    const imageVoteCount = imgIdx !== null
      ? allVotes.filter((v) => v.image_index === imgIdx).length
      : allVotes.filter((v) => v.image_index === null).length;

    return { voted, image_index: imgIdx, vote_count: contrib.vote_count, image_vote_count: imageVoteCount };
  }

  async remove(contributionId: string, userId: string, userRole: string) {
    const contrib = await this.contribRepo.findOne({ where: { id: contributionId } });
    if (!contrib) throw new NotFoundException('Contribution introuvable.');

    const isAuthor = contrib.user_id === userId;
    const isAdmin = userRole === 'admin';
    if (!isAuthor && !isAdmin) throw new ForbiddenException('Accès refusé.');

    await this.contribRepo.remove(contrib);
    return { message: 'Contribution supprimée.' };
  }
}
