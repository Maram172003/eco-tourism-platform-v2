import { Controller, Delete, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROVIDER, Role.ADMIN)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /**
   * Liste des notifications de l'utilisateur connecté
   */
  @Get()
  findAll(@Req() req: any) {
    return this.service.findByUser(req.user.sub);
  }

  /**
   * Marque une notification comme lue
   */
  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsRead(id, req.user.sub);
  }

  /**
   * Marque une notification comme non lue
   */
  @Patch(':id/unread')
  markUnread(@Req() req: any, @Param('id') id: string) {
    return this.service.markUnread(req.user.sub, id);
  }

  /**
   * Supprime une notification
   */
  @Delete(':id')
  deleteNotification(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteNotification(req.user.sub, id);
  }

  /**
   * Signale une notification
   */
  @Patch(':id/report')
  reportNotification(@Req() req: any, @Param('id') id: string) {
    return this.service.reportNotification(req.user.sub, id);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.service.markAllAsRead(req.user.sub);
  }

  /**
   * Compte des notifications non lues
   */
  @Get('unread')
  countUnread(@Req() req: any) {
    return this.service.countUnread(req.user.sub);
  }

  /**
   * Compte des notifications non lues (format objet, compat Maram)
   */
  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.service.unreadCount(req.user.sub).then((count) => ({ count }));
  }
}
