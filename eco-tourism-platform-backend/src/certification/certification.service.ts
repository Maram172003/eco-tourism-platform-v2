import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto, UpdateCertificationStatusDto } from './dto/certification.dto';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(Certification)
    private readonly repo: Repository<Certification>,
  ) {}

  async findByUser(userId: string): Promise<Certification[]> {
    return this.repo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async findPending(): Promise<Certification[]> {
    return this.repo.find({ where: { status: 'pending' }, order: { created_at: 'ASC' } });
  }

  async create(userId: string, dto: CreateCertificationDto): Promise<Certification> {
    const cert = this.repo.create({
      user_id: userId,
      name: dto.name,
      category: dto.category ?? null,
      description: dto.description ?? null,
      proof_url: dto.proof_url ?? null,
      file_url: dto.file_url ?? null,
      issued_by: dto.issued_by ?? null,
      issued_at: dto.issued_at ?? null,
      expires_at: dto.expires_at ?? null,
      status: 'pending',
    });
    return this.repo.save(cert);
  }

  async updateStatus(id: string, dto: UpdateCertificationStatusDto): Promise<Certification> {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certification introuvable');

    cert.status = dto.status;
    cert.rejection_reason = dto.rejection_reason ?? null;
    return this.repo.save(cert);
  }

  async update(id: string, dto: CreateCertificationDto): Promise<Certification> {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certification introuvable');
    cert.name = dto.name;
    cert.category = dto.category ?? null;
    cert.description = dto.description ?? null;
    cert.proof_url = dto.proof_url ?? null;
    cert.file_url = dto.file_url ?? null;
    cert.issued_by = dto.issued_by ?? null;
    cert.issued_at = dto.issued_at ?? null;
    cert.expires_at = dto.expires_at ?? null;
    return this.repo.save(cert);
  }

  async remove(id: string): Promise<void> {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certification introuvable');
    await this.repo.remove(cert);
  }

  async countByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { user_id: userId, status: 'approved' } });
  }

  async findApprovedByUser(userId: string): Promise<Certification[]> {
    return this.repo.find({ where: { user_id: userId, status: 'approved' }, order: { created_at: 'DESC' } });
  }

  async findAll(): Promise<Certification[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }
}
