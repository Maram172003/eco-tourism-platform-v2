import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/photo.dto';

@ApiTags('Photos')
@Controller('photos')
export class PhotoController {
  constructor(private readonly service: PhotoService) {}

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Post()
  create(@Req() req: any, @Body() body: CreatePhotoDto) {
    return this.service.create({ ...body, uploaded_by: req.user.sub });
  }

  @Public()
  @Get()
  findByEntity(
    @Query('entity_type') entityType: string,
    @Query('entity_id') entityId: string,
  ) {
    return this.service.findByEntity(entityType, entityId);
  }

  @Public()
  @Get('hero')
  getHero(
    @Query('entity_type') entityType: string,
    @Query('entity_id') entityId: string,
  ) {
    return this.service.getHero(entityType, entityId);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Post(':id/hero')
  setHero(@Param('id') id: string) {
    return this.service.setHero(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Post(':id/upvote')
  upvote(@Param('id') id: string) {
    return this.service.upvote(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Post(':id/downvote')
  downvote(@Param('id') id: string) {
    return this.service.downvote(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.sub);
  }
}
