import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IdentifyService } from './identify.service';
import { CreateIdentifyDto } from './dto/create-identify.dto';
import { UpdateIdentifyDto } from './dto/update-identify.dto';

@Controller('identify')
export class IdentifyController {
  constructor(private readonly identifyService: IdentifyService) {}

  @Post()
  create(@Body() createIdentifyDto: CreateIdentifyDto) {
    return this.identifyService.create(createIdentifyDto);
  }

  @Get()
  findAll() {
    return this.identifyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.identifyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIdentifyDto: UpdateIdentifyDto,
  ) {
    return this.identifyService.update(+id, updateIdentifyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.identifyService.remove(+id);
  }
}
