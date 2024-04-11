import { Injectable } from '@nestjs/common';
import { CreateIdentifyDto } from './dto/create-identify.dto';
import { UpdateIdentifyDto } from './dto/update-identify.dto';

@Injectable()
export class IdentifyService {
  create(createIdentifyDto: CreateIdentifyDto) {
    return 'This action adds a new identify';
  }

  findAll() {
    return `This action returns all identify`;
  }

  findOne(id: number) {
    return `This action returns a #${id} identify`;
  }

  update(id: number, updateIdentifyDto: UpdateIdentifyDto) {
    return `This action updates a #${id} identify`;
  }

  remove(id: number) {
    return `This action removes a #${id} identify`;
  }
}
