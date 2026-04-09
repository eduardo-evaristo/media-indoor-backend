import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create() {
    return this.devicesService.create();
  }

  @Post('activate')
  @UseGuards(AuthGuard('jwt')) //This'll come from the dashboard
  activate(
    @Body('activationToken') activationToken: string,
    @Request() request,
  ) {
    const userId = request.user.userId;
    return this.devicesService.activate(activationToken, userId);
  }

  // Add security to this
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.devicesService.findOne(id);
  }

  @Post(':id/regenerate-token')
  regenerateActivationToken(@Param('id', ParseUUIDPipe) deviceId: string) {
    return this.devicesService.regenerateActivationToken(deviceId);
  }
}
