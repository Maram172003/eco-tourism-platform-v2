import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Avis')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Public()
  @Get('target/:targetType/:targetId')
  findByTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.findByTarget(targetType, targetId);
  }

  @Public()
  @Get('testimonials')
  getTestimonials() {
    return this.service.getTestimonials();
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  @Public()
  @Get('average/:targetType/:targetId')
  getAverageRating(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.getAverageRating(targetType, targetId);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateReviewDto>,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }
}
