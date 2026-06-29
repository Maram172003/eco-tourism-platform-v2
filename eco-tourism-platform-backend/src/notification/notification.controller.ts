import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
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
}
