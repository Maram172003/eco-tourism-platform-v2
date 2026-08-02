import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from './entities/certification.entity';
import { CertificationService } from './certification.service';
import { CertificationController } from './certification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certification])],
  providers: [CertificationService],
  controllers: [CertificationController],
  exports: [CertificationService],
})
export class CertificationModule {}
