import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Follow')
@ApiBearerAuth('bearer')
@Controller('follows')
export class FollowController {
  constructor(private readonly service: FollowService) {}

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Post(':targetId/:targetType')
  follow(@Req() req: any, @Param('targetId') targetId: string, @Param('targetType') targetType: string) {
    const roleMap: Record<string, string> = {
      eco_traveler: 'eco_traveler',
      guide: 'guide',
      project: 'project',
    };
    return this.service.follow(req.user.sub, roleMap[req.user.role] ?? req.user.role, targetId, targetType);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Delete(':targetId')
  unfollow(@Req() req: any, @Param('targetId') targetId: string) {
    return this.service.unfollow(req.user.sub, targetId);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('following')
  getFollowing(@Req() req: any) {
    return this.service.getFollowing(req.user.sub);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('followers')
  getFollowers(@Req() req: any) {
    return this.service.getFollowers(req.user.sub);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('count')
  getFollowerCount(@Req() req: any) {
    return this.service.getFollowerCount(req.user.sub);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('status/:targetId')
  getStatus(@Req() req: any, @Param('targetId') targetId: string) {
    return this.service.getFollowStatus(req.user.sub, targetId);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('following/profiles')
  getFollowingProfiles(@Req() req: any) {
    return this.service.getFollowingWithProfiles(req.user.sub);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Get('followers/profiles')
  getFollowersProfiles(@Req() req: any) {
    return this.service.getFollowersWithProfiles(req.user.sub);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT)
  @Delete('follower/:followerId')
  removeFollower(@Req() req: any, @Param('followerId') followerId: string) {
    return this.service.removeFollower(req.user.sub, followerId);
  }

  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.ADMIN)
  @Get('followers/public/:userId')
  getFollowersOfUser(@Param('userId') userId: string) {
    return this.service.getFollowersOfUserWithProfiles(userId);
  }
}
