import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { Public } from '../common/decorators/public.decorator';
import { GuideService } from './guide.service';
import { GuideSearchService } from './guide-search.service';
import {
  CompleteGuideProfileDto,
  UpdateGuideSpecialtiesDto,
  UpdateGuideExperienceDto,
} from './dto/guide.dto';

@ApiTags('Guide')
@ApiBearerAuth('bearer')
@Roles(Role.GUIDE)
@Controller('guide')
export class GuideController {
  constructor(
    private readonly service: GuideService,
    private readonly searchService: GuideSearchService,
  ) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.sub);
  }

  @Post('profile')
  completeProfile(@Req() req: any, @Body() dto: CompleteGuideProfileDto) {
    return this.service.completeProfile(req.user.sub, dto);
  }

  @Patch('specialties')
  updateSpecialties(@Req() req: any, @Body() dto: UpdateGuideSpecialtiesDto) {
    return this.service.updateSpecialties(req.user.sub, dto);
  }

  @Patch('experience')
  updateExperience(@Req() req: any, @Body() dto: UpdateGuideExperienceDto) {
    return this.service.updateExperience(req.user.sub, dto);
  }

  @Post('onboarded')
  markOnboarded(@Req() req: any) {
    return this.service.markOnboarded(req.user.sub);
  }

  @Public()
  @Roles()
  @Get('public/search')
  searchGuides(@Query('q') q: string) {
    return this.service.searchGuides(q ?? '');
  }

  @Public()
  @Roles()
  @Get('search')
  advancedSearch(
    @Query('date') date?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius_km') radius_km?: string,
    @Query('language') language?: string,
    @Query('max_price') max_price?: string,
    @Query('displacement_allowed') displacement_allowed?: string,
    @Query('zone') zone?: string,
    @Query('q') q?: string,
  ) {
    return this.searchService.search({
      date,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius_km: radius_km ? parseFloat(radius_km) : undefined,
      language,
      max_price: max_price ? parseFloat(max_price) : undefined,
      displacement_allowed: displacement_allowed === 'true' ? true : undefined,
      zone,
      query: q,
    });
  }

  @Public()
  @Roles()
  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.service.getPublicProfile(userId);
  }
}
