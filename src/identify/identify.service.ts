import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
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

    // Check if primary contact needs to be turned into secondary

    console.log(
      'Checking if primary contact needs to be turned into secondary',
    );

    if (email && phoneNumber) {
      const primaryContactsWithSameEmailOrPhoneNumber =
        await this.contactRepository.find({
          where: [
            {
              email: email ?? undefined,
              linkPrecedence: LinkPrecedence.PRIMARY,
            },
            {
              phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
              linkPrecedence: LinkPrecedence.PRIMARY,
            },
          ],
        });

      console.log(
        'primaryContactsWithSameEmailOrPhoneNumber',
        primaryContactsWithSameEmailOrPhoneNumber,
      );

      if (primaryContactsWithSameEmailOrPhoneNumber.length > 1) {
        // Find the oldest contact
        const oldestContact = primaryContactsWithSameEmailOrPhoneNumber.reduce(
          (oldest, current) =>
            oldest.createdAt < current.createdAt ? oldest : current,
        );

        // Update the other contacts
        for (const contact of primaryContactsWithSameEmailOrPhoneNumber) {
          if (contact.id !== oldestContact.id) {
            contact.linkedId = oldestContact.id;
            contact.linkPrecedence = LinkPrecedence.SECONDARY;
            await this.contactRepository.save(contact);
          }
        }
      }
    }

    if (!primaryContact) {
      // If no primary contact found, try to find a primary contact based on email or phone number separately
      console.log(
        'no primary contact found, trying to find a primary contact based on email or phone number separately',
        email,
        phoneNumber,
      );
      primaryContact = await this.contactRepository.findOne({
        where: [
          {
            email: Raw((alias) => `${alias} = '${email}'`),
            linkPrecedence: LinkPrecedence.PRIMARY,
          },
          {
            phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
            linkPrecedence: LinkPrecedence.PRIMARY,
          },
        ],
      });

      if (!primaryContact) {
        console.log('Finding related contacts');
        const relatedContacts = await this.contactRepository.find({
          where: [
            {
              email: Raw((alias) => `${alias} = '${email}'`),
            },
            {
              phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
            },
          ],
        });

        console.log('Related Contacts', relatedContacts);

        let primaryContactId: number | undefined;

        for (const contact of relatedContacts) {
          if (contact.linkedId !== null) {
            primaryContactId = contact.linkedId;
            break;
          }
        }

        if (primaryContactId) {
          primaryContact = await this.contactRepository.findOne({
            where: [{ id: primaryContactId }],
          });
        }
      }

      if (!primaryContact) {
        // If still no primary contact found, create a new one
        console.log('no primary contact found, creating a new one');
        primaryContact = new Contact();
        primaryContact.email = email ?? null;
        primaryContact.phoneNumber = phoneNumber
          ? phoneNumber.toString()
          : null;
        await this.contactRepository.save(primaryContact);
      } else {
        // If a primary contact is found based on email or phone number separately, update the contact details if necessary
        console.log(
          'primary contact is found based on email or phone number',
          primaryContact,
        );
        if (email && primaryContact.email !== email) {
          // Check if a secondary contact with the same email already exists
          console.log(
            'Checking if a secondary contact with the same email already exists',
          );
          const existingEmailContact = await this.contactRepository.findOne({
            where: { email, linkedId: primaryContact.id },
          });

          if (!existingEmailContact) {
            const secondaryEmailContact = new Contact();
            secondaryEmailContact.email = email;
            secondaryEmailContact.phoneNumber = phoneNumber;
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
          console.log(
            'Checking if a secondary contact with the same phone number already exists',
          );
          const existingPhoneContact = await this.contactRepository.findOne({
            where: {
              phoneNumber: phoneNumber.toString(),
              linkedId: primaryContact.id,
            },
          });

          if (!existingPhoneContact) {
            const secondaryPhoneContact = new Contact();
            secondaryPhoneContact.phoneNumber = phoneNumber.toString();
            secondaryPhoneContact.email = email;
            secondaryPhoneContact.linkedId = primaryContact.id;
            secondaryPhoneContact.linkPrecedence = LinkPrecedence.SECONDARY;
            await this.contactRepository.save(secondaryPhoneContact);
          }
        }
      }
    } else {
      // If a primary contact is found, update the contact details if necessary
      console.log(
        'primary contact is found',
        primaryContact.email,
        primaryContact.phoneNumber,
      );
      if (email && primaryContact.email !== email) {
        // Check if a secondary contact with the same email already exists
        const existingEmailContact = await this.contactRepository.findOne({
          where: { email, linkedId: primaryContact.id },
        });

        if (!existingEmailContact) {
          const secondaryEmailContact = new Contact();
          secondaryEmailContact.email = email;
          secondaryEmailContact.phoneNumber = phoneNumber;
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
          secondaryPhoneContact.email = email;
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
