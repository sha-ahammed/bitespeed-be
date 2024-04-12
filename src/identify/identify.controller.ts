import { Controller, Post, Body } from '@nestjs/common';
import { IdentifyService } from './identify.service';
import { CustomerContactDetailsRequest } from './dto/customer-contact-details.dto';

@Controller('identify')
export class IdentifyController {
  constructor(private readonly identifyService: IdentifyService) {}

  @Post()
  getCustomerContactDetails(@Body() request: CustomerContactDetailsRequest) {
    return this.identifyService.getCustomerContactDetails(request);
  }
}
