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
  Query,
  ParseBoolPipe,
  UseInterceptors,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateDeviceDto } from './dto/update-device.dto';
import ObjectSignerInterceptor from 'src/common/interceptors/ObjectSignerInterceptor.interceptor';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Request() request,
    @Query('playlist', ParseBoolPipe) playlist: boolean,
  ) {
    const userId = request.user.userId;
    if (playlist === true)
      return this.devicesService.findAllWithPlaylist(userId);

    return this.devicesService.findAll(userId);
  }

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

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Request() request,
  ) {
    const userId = request.user.userId;
    return this.devicesService.update(id, userId, updateDeviceDto);
  }

  // Add security to this
  @Get(':id')
  @UseInterceptors(ObjectSignerInterceptor)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('deviceToken') deviceToken: string,
  ) {
    return this.devicesService.findOne(id, deviceToken);
  }

  @Get('activation/:token/status')
  pollDeviceStatus(@Param('token') activationToken: string) {
    return this.devicesService.pollDevice(activationToken);
  }

  @Post(':id/regenerate-token')
  regenerateActivationToken(@Param('id', ParseUUIDPipe) deviceId: string) {
    return this.devicesService.regenerateActivationToken(deviceId);
  }
}
