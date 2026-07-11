import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { PublicationService } from './publication.service';
import {
  CreatePublicationDto,
  UpdatePublicationDto,
} from './dto/publication.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Publications')
@Controller('publications')
export class PublicationController {
  constructor(private readonly service: PublicationService) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePublicationDto) {
    return this.service.create(req.user.sub, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findByAuthor(req.user.sub);
  }

  @Public()
  @Get('experiences')
  findAllExperiences(@Query('region') region?: string) {
    return this.service.findAllExperiences(region);
  }

  @Public()
  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string) {
    return this.service.findPublicByAuthor(authorId);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePublicationDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.sub, id);
  }

  // ─── Interactions (batch) ─────────────────────────────────────────────────

  @Public()
  @Post('interactions/batch')
  getBatchInteractions(@Body() body: { ids: string[]; viewer?: string }) {
    return this.service.getBatchInteractions(body.ids, body.viewer);
  }

  // ─── Publication Likes ────────────────────────────────────────────────────

  @Public()
  @Get(':id/interactions')
  getInteractions(@Param('id') id: string, @Query('viewer') viewer?: string) {
    return this.service.getInteractions(id, viewer);
  }

  @Public()
  @Get(':id/likes')
  getLikers(@Param('id') id: string) {
    return this.service.getLikers(id);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post(':id/like')
  toggleLike(@Req() req: any, @Param('id') id: string) {
    return this.service.toggleLike(id, req.user.sub, req.user.role);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Public()
  @Get(':id/comments')
  getComments(@Param('id') id: string, @Query('viewer') viewer?: string) {
    return this.service.getComments(id, viewer);
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post(':id/comments')
  addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    return this.service.addComment(id, req.user.sub, req.user.role, content);
  }

  // ─── Comment Likes & Replies ──────────────────────────────────────────────

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post('comments/:commentId/like')
  toggleCommentLike(@Req() req: any, @Param('commentId') commentId: string) {
    return this.service.toggleCommentLike(
      commentId,
      req.user.sub,
      req.user.role,
    );
  }

  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Post('comments/:commentId/reply')
  addReply(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    return this.service.addReply(
      commentId,
      req.user.sub,
      req.user.role,
      content,
    );
  }
  @ApiBearerAuth('bearer')
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
  @Delete('comments/:commentId')
  deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
    return this.service.deleteComment(commentId, req.user.sub);
  }

  // ─── Places / Trending / Heatmap ──────────────────────────────────────────

  @Public()
  @Get('places')
  findAllPlaces(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('region') region?: string,
  ) {
    return this.service.findAllPlaces(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      region,
    );
  }

  @Public()
  @Get('places/trending')
  findTrending(@Query('limit') limit?: string) {
    return this.service.findTrending(limit ? parseInt(limit) : 20);
  }

  @Public()
  @Get('places/category/:category')
  findByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByCategory(category, limit ? parseInt(limit) : 20);
  }

  @Public()
  @Get('heatmap')
  getHeatmap() {
    return this.service.getHeatmapData();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
