import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payment Providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'List all payment providers and their status' })
  getAllProviders() {
    return this.providersService.getAllProviders();
  }

  @Patch(':id/health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Enable or disable a payment provider' })
  updateHealth(
    @Param('id') providerId: string,
    @Body() body: { isHealthy: boolean },
  ) {
    return this.providersService.setHealthStatus(providerId, body.isHealthy);
  }
}
