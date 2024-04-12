import { Injectable } from '@nestjs/common';
import { CustomerContactDetailsRequest } from './dto/customer-contact-details.dto';

@Injectable()
export class IdentifyService {
  getCustomerContactDetails(request: CustomerContactDetailsRequest) {
    return { email: request.email, phoneNumber: request.phoneNumber };
  }
}
