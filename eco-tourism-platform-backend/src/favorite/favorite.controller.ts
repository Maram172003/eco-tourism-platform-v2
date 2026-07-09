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
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiTags('Favoris')
@ApiBearerAuth('bearer')
@Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly service: FavoriteService) {}

  @Post()
  toggle(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    return this.service.toggle(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query('type') type?: string) {
    return this.service.findAll(req.user.sub, type);
  }

  @Get('check/:targetType/:targetId')
  check(
    @Req() req: any,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.check(req.user.sub, targetType, targetId);
  }

  @Get('count/:targetType')
  count(@Req() req: any, @Param('targetType') targetType: string) {
    return this.service.count(req.user.sub, targetType);
  }

  @Delete(':targetType/:targetId')
  remove(
    @Req() req: any,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.service.remove(req.user.sub, targetType, targetId);
  }
}
