import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  async findByPlace(placeId: string): Promise<Event[]> {
    return this.repo.find({
      where: { place_id: placeId, status: 'published' },
      order: { start_date: 'ASC' },
    });
  }

  async findUpcomingByPlace(placeId: string): Promise<Event[]> {
    const now = new Date();
    return this.repo
      .find({
        where: { place_id: placeId, status: 'published' },
        order: { start_date: 'ASC' },
      })
      .then((events) =>
        events.filter(
          (e) =>
            new Date(e.start_date) >= now ||
            (e.end_date && new Date(e.end_date) >= now),
        ),
      );
  }

  async create(
    placeId: string,
    userId: string,
    dto: CreateEventDto,
  ): Promise<Event> {
    const event = this.repo.create({
      place_id: placeId,
      created_by: userId,
      title: dto.title,
      description: dto.description ?? null,
      event_type: dto.event_type,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      images: dto.images?.length ? dto.images : null,
      external_url: dto.external_url ?? null,
    });
    return this.repo.save(event);
  }

  async update(
    eventId: string,
    userId: string,
    dto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.repo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Événement introuvable.');
    if (event.created_by !== userId)
      throw new ForbiddenException('Accès refusé.');
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.event_type !== undefined) event.event_type = dto.event_type;
    if (dto.start_date !== undefined)
      event.start_date = new Date(dto.start_date);
    if (dto.end_date !== undefined)
      event.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.images !== undefined)
      event.images = dto.images.length ? dto.images : null;
    if (dto.external_url !== undefined) event.external_url = dto.external_url;
    if (dto.status !== undefined) event.status = dto.status;
    return this.repo.save(event);
  }

  async remove(eventId: string, userId: string): Promise<void> {
    const event = await this.repo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Événement introuvable.');
    if (event.created_by !== userId)
      throw new ForbiddenException('Accès refusé.');
    await this.repo.remove(event);
  }
}
