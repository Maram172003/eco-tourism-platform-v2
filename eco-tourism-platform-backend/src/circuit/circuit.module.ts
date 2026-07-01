import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circuit } from './entities/circuit.entity';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Circuit])],
  providers: [CircuitService],
  controllers: [CircuitController],
  exports: [CircuitService],
})
export class CircuitModule {}
