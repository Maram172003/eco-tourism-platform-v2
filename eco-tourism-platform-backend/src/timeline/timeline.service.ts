import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimelineEntry } from './entities/timeline-entry.entity';
import {
  CreateTimelineEntryDto,
  UpdateTimelineEntryDto,
  BulkSaveTimelineDto,
} from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TimelineEntry)
    private readonly repo: Repository<TimelineEntry>,
  ) {}

  async findByPublication(publicationId: string): Promise<TimelineEntry[]> {
    return this.repo.find({
      where: { publication_id: publicationId },
      order: { step_order: 'ASC' },
    });
  }

  async create(
    publicationId: string,
    dto: CreateTimelineEntryDto,
  ): Promise<TimelineEntry> {
    const entry = this.repo.create({
      publication_id: publicationId,
      step_order: dto.step_order,
      emoji: dto.emoji ?? '📍',
      time_label: dto.time_label,
      title: dto.title,
      description: dto.description ?? null,
      duration_minutes: dto.duration_minutes ?? null,
      distance_km: dto.distance_km ?? null,
      transport_mode: dto.transport_mode ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
    });
    return this.repo.save(entry);
  }

  async bulkSave(
    publicationId: string,
    dto: BulkSaveTimelineDto,
  ): Promise<TimelineEntry[]> {
    await this.repo.delete({ publication_id: publicationId });
    if (dto.entries.length === 0) return [];
    const entries = dto.entries.map((e, i) =>
      this.repo.create({
        publication_id: publicationId,
        step_order: e.step_order ?? i,
        emoji: e.emoji ?? '📍',
        time_label: e.time_label,
        title: e.title,
        description: e.description ?? null,
        duration_minutes: e.duration_minutes ?? null,
        distance_km: e.distance_km ?? null,
        transport_mode: e.transport_mode ?? null,
        latitude: e.latitude ?? null,
        longitude: e.longitude ?? null,
      }),
    );
    return this.repo.save(entries);
  }

  async update(
    entryId: string,
    dto: UpdateTimelineEntryDto,
  ): Promise<TimelineEntry> {
    const entry = await this.repo.findOne({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entrée de timeline introuvable.');
    if (dto.step_order !== undefined) entry.step_order = dto.step_order;
    if (dto.emoji !== undefined) entry.emoji = dto.emoji;
    if (dto.time_label !== undefined) entry.time_label = dto.time_label;
    if (dto.title !== undefined) entry.title = dto.title;
    if (dto.description !== undefined) entry.description = dto.description;
    if (dto.duration_minutes !== undefined)
      entry.duration_minutes = dto.duration_minutes;
    if (dto.distance_km !== undefined) entry.distance_km = dto.distance_km;
    if (dto.transport_mode !== undefined)
      entry.transport_mode = dto.transport_mode;
    if (dto.latitude !== undefined) entry.latitude = dto.latitude;
    if (dto.longitude !== undefined) entry.longitude = dto.longitude;
    return this.repo.save(entry);
  }

  async remove(entryId: string): Promise<void> {
    const entry = await this.repo.findOne({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entrée de timeline introuvable.');
    await this.repo.remove(entry);
  }
}
