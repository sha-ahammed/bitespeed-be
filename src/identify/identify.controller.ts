import { Controller, Post, Body } from '@nestjs/common';
import { IdentifyService } from './identify.service';
import { CustomerContactDetailsRequest } from './dto/customer-contact-details.dto';

@Controller('identify')
export class IdentifyController {
  constructor(private readonly identifyService: IdentifyService) {}

  @Post()
  async getCustomerContactDetails(
    @Body() request: CustomerContactDetailsRequest,
  ) {
    const response =
      await this.identifyService.getCustomerContactDetails(request);
    return response;
  }
}
