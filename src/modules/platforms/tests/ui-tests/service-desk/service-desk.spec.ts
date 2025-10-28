import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ServiceDeskPage } from '../../../pages/service-desk/serviceDeskPage';
import { ServiceDeskTestData } from '../../test-data/service-desk.test-data';

test.describe('service desk - Create Ticket', () => {
  test(
    'verify whether user is able to raise a new ticket with mandatory details, and the system generates a unique ticket ID with acknowledgment',
    { tag: [TestPriority.P0, '@service-desk'] },
    async ({ serviceDeskPage }: { serviceDeskPage: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['SHSD-101'],
      });

      const serviceDesk = new ServiceDeskPage(serviceDeskPage);
      // Navigate to Service Desk page after login
      await serviceDesk.loadPage();
      // Create ticket using test data with dynamic values
      const ticketData = ServiceDeskTestData.sampleTickets.hrTicket;
      await serviceDesk.createTicket({
        ...ticketData,
        subject: `${ticketData.subject} ${faker.string.alphanumeric(8)}`,
        description: `${ticketData.description} ${faker.lorem.sentence()}`,
      });

      // Verify ticket creation success and get ticket ID
      const ticketId = await serviceDesk.verifyTicketCreationSuccess();

      // Verify ticket ID format matches expected pattern
      expect(ticketId).toMatch(ServiceDeskTestData.ticketIdPatterns.general);

      // Log ticket ID for reference
      console.log(`Created ticket with ID: ${ticketId}`);

      // Cleanup: Delete the created ticket
      await serviceDesk.deleteTicket(ticketId);
      console.log(`Cleaned up ticket: ${ticketId}`);
    }
  );
});
