import { Body, Controller, Get, Param, Patch, Post, Delete, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { AdminService } from './admin.service';
import { RejectDto } from './dto/admin.dto';
import { ReportsService } from '../reports/reports.service';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string; role: string };
}

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly service: AdminService,
    private readonly reportsService: ReportsService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  @Get('stats/overview')
  getStatsOverview() {
    return this.service.getStatsOverview();
  }

  // ─── Publications ─────────────────────────────────────────────────────────

  @Get('publications/pending')
  getPendingPublications() {
    return this.service.getPendingPublications();
  }

  @Get('publications/:id')
  getPublicationDetail(@Param('id') id: string) {
    return this.service.getPublicationDetail(id);
  }

  @Patch('publications/:id/approve')
  approvePublication(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approvePublication(id, req.user.sub);
  }

  @Patch('publications/:id/reject')
  rejectPublication(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.rejectPublication(id, dto.reason, req.user.sub);
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  @Get('offers/pending')
  getPendingOffers() {
    return this.service.getPendingOffers();
  }

  @Get('offers/:id')
  getOfferDetail(@Param('id') id: string) {
    return this.service.getOfferDetail(id);
  }

  @Patch('offers/:id/approve')
  approveOffer(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveOffer(id, req.user.sub);
  }

  @Patch('offers/:id/reject')
  rejectOffer(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.rejectOffer(id, dto.reason, req.user.sub);
  }

  // ─── Venues ───────────────────────────────────────────────────────────────

  @Get('projects/pending')
  getPendingProjects() {
    return this.service.getPendingProjects();
  }

  @Get('projects/:id')
  getVenueDetail(@Param('id') id: string) {
    return this.service.getVenueDetail(id);
  }

  @Patch('projects/:id/approve')
  approveProject(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveProject(id, req.user.sub);
  }

  @Patch('projects/:id/reject')
  rejectProject(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.rejectProject(id, dto.reason, req.user.sub);
  }

  // ─── Circuits ──────────────────────────────────────────────────────────────

  @Get('circuits/pending')
  getPendingCircuits() {
    return this.service.getPendingCircuits();
  }

  @Get('circuits/:id')
  getCircuitDetail(@Param('id') id: string) {
    return this.service.getCircuitDetail(id);
  }

  @Patch('circuits/:id/approve')
  approveCircuit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveCircuit(id, req.user.sub);
  }

  @Patch('circuits/:id/reject')
  rejectCircuit(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.rejectCircuit(id, dto.reason, req.user.sub);
  }

  @Patch('circuits/:id/archive')
  archiveCircuit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.archiveCircuit(id, req.user.sub);
  }

  // ─── Guide Offerings ───────────────────────────────────────────────────────

  @Get('guide-offerings/pending')
  getPendingGuideOfferings() {
    return this.service.getPendingGuideOfferings();
  }

  @Get('guide-offerings/:id')
  getGuideOfferingDetail(@Param('id') id: string) {
    return this.service.getGuideOfferingDetail(id);
  }

  @Patch('guide-offerings/:id/approve')
  approveGuideOffering(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.approveGuideOffering(id, req.user.sub);
  }

  @Patch('guide-offerings/:id/reject')
  rejectGuideOffering(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.rejectGuideOffering(id, dto.reason, req.user.sub);
  }

  @Patch('guide-offerings/:id/archive')
  archiveGuideOffering(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.archiveGuideOffering(id, req.user.sub);
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  @Get('users')
  getAllUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getAllUsers({ role, status, search, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('users/banned')
  getBannedUsers() {
    return this.service.getBannedUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.service.getUserById(id);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.service.updateUserRole(id, body.role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.service.deleteUser(id);
  }

  @Patch('users/:id/ban')
  updateBan(@Param('id') id: string, @Body() body: { ban_days?: number; note?: string }) {
    return this.service.updateBan(id, body.ban_days, body.note);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.service.unbanUser(id);
  }

  // ─── Providers ────────────────────────────────────────────────────────────

  @Get('providers')
  getAllProviders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getAllProviders({ status, search, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Patch('providers/:id/suspend')
  suspendProvider(@Param('id') id: string) {
    return this.service.suspendProvider(id);
  }

  @Patch('providers/:id/reactivate')
  reactivateProvider(@Param('id') id: string) {
    return this.service.reactivateProvider(id);
  }

  // ─── Reservations ──────────────────────────────────────────────────────────

  @Get('reservations')
  getAllReservations(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getAllReservations({ status, search, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  @Get('reviews')
  getAllReviews(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getAllReviews({ page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.service.deleteReview(id);
  }

  // ─── Sustainability ───────────────────────────────────────────────────────

  @Get('sustainability')
  getSustainabilityStats() {
    return this.service.getSustainabilityStats();
  }

  // ─── Reports ──────────────────────────────────────────────────────────────

  @Get('reports')
  getReports() {
    return this.reportsService.getAllReports();
  }

  @Patch('reports/:id/resolve')
  resolveReport(@Param('id') id: string, @Body() body: { action: string; note?: string; ban_days?: number }) {
    return this.reportsService.resolveReport(id, body.action, body.note ?? '', body.ban_days);
  }

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  @Get('audit-logs')
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getAuditLogs({ page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }
}
