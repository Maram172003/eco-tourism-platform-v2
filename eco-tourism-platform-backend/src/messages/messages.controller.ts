import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@ApiTags('Messages')
@ApiBearerAuth('bearer')
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  /** Create or retrieve a conversation with a recipient */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Post('conversations')
  createOrGet(@Req() req: any, @Body() body: { recipient_id: string }) {
    return this.service.createOrGet(req.user.sub, req.user.role, body.recipient_id);
  }

  /** List all my conversations */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Get('conversations')
  getMyConversations(@Req() req: any) {
    return this.service.getMyConversations(req.user.sub);
  }

  /** Get a specific conversation details */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Get('conversations/:id')
  getConversation(@Req() req: any, @Param('id') id: string) {
    return this.service.getConversation(id, req.user.sub);
  }

  /** Delete a conversation (and its messages) */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Delete('conversations/:id')
  deleteConversation(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteConversation(id, req.user.sub);
  }

  /** Get messages of a conversation */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Get('conversations/:id/messages')
  getMessages(@Req() req: any, @Param('id') id: string) {
    return this.service.getMessages(id, req.user.sub);
  }

  /** Send a message */
  @Roles(Role.ECO_TRAVELER, Role.GUIDE, Role.PROJECT, Role.PROVIDER)
  @Post()
  sendMessage(@Req() req: any, @Body() body: { conversation_id: string; content: string }) {
    return this.service.sendMessage(body.conversation_id, req.user.sub, req.user.role, body.content);
  }
}
