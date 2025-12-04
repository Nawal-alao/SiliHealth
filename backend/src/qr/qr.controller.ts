import { Body, Controller, Post, Get, Param, Delete, UseGuards, Request, Ip } from '@nestjs/common';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  /**
   * Générer un nouveau QR code pour un patient (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Post('qr/generate/:patientId')
  async generateQR(@Param('patientId') patientId: string, @Request() req) {
    return this.qrService.generateQRCode(patientId, req.user.id);
  }

  /**
   * Scanner un QR code par secureToken (accès public)
   */
  @Get('qr/scan/:secureToken')
  async scanQR(
    @Param('secureToken') secureToken: string,
    @Request() req,
    @Ip() ipAddress: string
  ) {
    return this.qrService.scanQRCode(secureToken, req.headers['user-agent'], ipAddress);
  }

  /**
   * Accès QR par patientId direct (pour /qr-access/[id])
   */
  @Get('qr/access/:patientId')
  async accessByPatientId(
    @Param('patientId') patientId: string,
    @Request() req,
    @Ip() ipAddress: string
  ) {
    return this.qrService.accessByPatientId(patientId, req.headers['user-agent'], ipAddress);
  }

  /**
   * Logger un accès QR (public)
   */
  @Post('qr/log-access')
  async logQRAccess(
    @Body() body: { patientId: string; emergency: boolean; deviceFingerprint: string; timestamp: string; userAgent: string },
    @Request() req,
    @Ip() ipAddress: string
  ) {
    return this.qrService.logQRAccess(
      body.patientId,
      body.emergency || false,
      body.deviceFingerprint || 'unknown',
      req.headers['user-agent'] || body.userAgent,
      ipAddress
    );
  }

  /**
   * Accès d'urgence via QR code (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Post('qr/emergency/:secureToken')
  async emergencyAccess(
    @Param('secureToken') secureToken: string,
    @Body() body: { accessCode: string; accessReason: string },
    @Request() req
  ) {
    return this.qrService.emergencyAccess(secureToken, body.accessCode, req.user.id, body.accessReason);
  }

  /**
   * Désactiver un QR code (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Delete('qr/:qrLinkId')
  async deactivateQR(@Param('qrLinkId') qrLinkId: string, @Request() req) {
    return this.qrService.deactivateQRCode(qrLinkId, req.user.id);
  }

  /**
   * Lister les QR codes d'un patient
   */
  @UseGuards(JwtAuthGuard)
  @Get('qr/patient/:patientId')
  async getPatientQRCodes(@Param('patientId') patientId: string, @Request() req) {
    return this.qrService.getPatientQRCodes(patientId, req.user.id);
  }

  /**
   * Ancienne route pour compatibilité (sera supprimée)
   * @deprecated Utiliser /api/qr/scan/:secureToken à la place
   */
  @Post('qr-verify')
  async verifyQR(
    @Body() body: { patientId: string; timestamp: string; userAgent: string },
  ) {
    return this.qrService.scanQRCode(body.patientId, body.userAgent);
  }
}
