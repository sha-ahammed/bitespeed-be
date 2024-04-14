import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerContactDetailsRequest } from './dto/customer-contact-details.dto';
import { Contact, LinkPrecedence } from './entities/contact.entity';

@Injectable()
export class IdentifyService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async getCustomerContactDetails(request: CustomerContactDetailsRequest) {
    const { email, phoneNumber } = request;

    // Find the primary contact based on email or phone number
    let primaryContact = await this.contactRepository.findOne({
      where: [
        {
          email: email ?? undefined,
          phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
          linkPrecedence: LinkPrecedence.PRIMARY,
        },
      ],
    });

    if (!primaryContact) {
      // If no primary contact found, try to find a primary contact based on email or phone number separately
      primaryContact = await this.contactRepository.findOne({
        where: [
          { email: email ?? undefined, linkPrecedence: LinkPrecedence.PRIMARY },
          {
            phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
            linkPrecedence: LinkPrecedence.PRIMARY,
          },
        ],
      });

      if (!primaryContact) {
        // If still no primary contact found, create a new one
        primaryContact = new Contact();
        primaryContact.email = email ?? null;
        primaryContact.phoneNumber = phoneNumber
          ? phoneNumber.toString()
          : null;
        await this.contactRepository.save(primaryContact);
      } else {
        // If a primary contact is found based on email or phone number separately, update the contact details if necessary
        if (email && primaryContact.email !== email) {
          // Check if a secondary contact with the same email already exists
          const existingEmailContact = await this.contactRepository.findOne({
            where: { email, linkedId: primaryContact.id },
          });

          if (!existingEmailContact) {
            const secondaryEmailContact = new Contact();
            secondaryEmailContact.email = email;
            secondaryEmailContact.phoneNumber = primaryContact.phoneNumber;
            secondaryEmailContact.linkedId = primaryContact.id;
            secondaryEmailContact.linkPrecedence = LinkPrecedence.SECONDARY;
            await this.contactRepository.save(secondaryEmailContact);
          }
        }

        if (
          phoneNumber &&
          primaryContact.phoneNumber !== phoneNumber.toString()
        ) {
          // Check if a secondary contact with the same phone number already exists
          const existingPhoneContact = await this.contactRepository.findOne({
            where: {
              phoneNumber: phoneNumber.toString(),
              linkedId: primaryContact.id,
            },
          });

          if (!existingPhoneContact) {
            const secondaryPhoneContact = new Contact();
            secondaryPhoneContact.phoneNumber = phoneNumber.toString();
            secondaryPhoneContact.email = primaryContact.email;
            secondaryPhoneContact.linkedId = primaryContact.id;
            secondaryPhoneContact.linkPrecedence = LinkPrecedence.SECONDARY;
            await this.contactRepository.save(secondaryPhoneContact);
          }
        }
      }
    } else {
      // If a primary contact is found, update the contact details if necessary
      if (email && primaryContact.email !== email) {
        // Check if a secondary contact with the same email already exists
        const existingEmailContact = await this.contactRepository.findOne({
          where: { email, linkedId: primaryContact.id },
        });

        if (!existingEmailContact) {
          const secondaryEmailContact = new Contact();
          secondaryEmailContact.email = email;
          secondaryEmailContact.phoneNumber = primaryContact.phoneNumber;
          secondaryEmailContact.linkedId = primaryContact.id;
          secondaryEmailContact.linkPrecedence = LinkPrecedence.SECONDARY;
          await this.contactRepository.save(secondaryEmailContact);
        }
      }

      if (
        phoneNumber &&
        primaryContact.phoneNumber !== phoneNumber.toString()
      ) {
        // Check if a secondary contact with the same phone number already exists
        const existingPhoneContact = await this.contactRepository.findOne({
          where: {
            phoneNumber: phoneNumber.toString(),
            linkedId: primaryContact.id,
          },
        });

        if (!existingPhoneContact) {
          const secondaryPhoneContact = new Contact();
          secondaryPhoneContact.phoneNumber = phoneNumber.toString();
          secondaryPhoneContact.email = primaryContact.email;
          secondaryPhoneContact.linkedId = primaryContact.id;
          secondaryPhoneContact.linkPrecedence = LinkPrecedence.SECONDARY;
          await this.contactRepository.save(secondaryPhoneContact);
        }
      }
    }

    // Find all secondary contacts linked to the primary contact
    const secondaryContacts = await this.contactRepository.find({
      where: {
        linkedId: primaryContact.id,
        linkPrecedence: LinkPrecedence.SECONDARY,
      },
    });

    // Use sets to store unique emails and phone numbers
    const uniqueEmails = new Set<string>();
    const uniquePhoneNumbers = new Set<string>();

    // Add primary contact's email and phone number to the sets if they are not null
    if (primaryContact.email) {
      uniqueEmails.add(primaryContact.email);
    }
    if (primaryContact.phoneNumber) {
      uniquePhoneNumbers.add(primaryContact.phoneNumber);
    }

    // Add secondary contacts' emails and phone numbers to the sets if they are not null
    secondaryContacts.forEach((contact) => {
      if (contact.email) {
        uniqueEmails.add(contact.email);
      }
      if (contact.phoneNumber) {
        uniquePhoneNumbers.add(contact.phoneNumber);
      }
    });

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(uniqueEmails),
        phoneNumbers: Array.from(uniquePhoneNumbers),
        secondaryContactIds: secondaryContacts.map((contact) => contact.id),
      },
    };
  }
}
