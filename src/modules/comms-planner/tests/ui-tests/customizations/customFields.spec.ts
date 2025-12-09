import { CUSTOM_FIELD_META } from '@modules/comms-planner/constants/customField';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import { runCustomFieldLifecycle } from '@modules/comms-planner/helpers/customField';
import { CustomFieldsPage } from '@modules/comms-planner/pages/customizations/customFieldsPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('customizations - Custom field', () => {
  let customFieldsPage: CustomFieldsPage;

  test.beforeEach(async ({ appManagersPage }) => {
    customFieldsPage = new CustomFieldsPage(appManagersPage);

    await customFieldsPage.loadPage({ stepInfo: 'Loading comms planner - customization page' });
    await customFieldsPage.verifyThePageIsLoaded();
  });

  for (const entity of Array.from(CUSTOM_FIELD_META.keys())) {
    test(
      `verify custom field creation | ${entity}`,
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@COMMS-PLANNER',
          '@CUSTOM-FIELDS_COMMS-PLANNER',
          TestGroupType.HEALTHCHECK,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: `Verify custom field creation | ${entity}`,
          zephyrTestId: '',
          storyId: '',
        });

        const meta = CUSTOM_FIELD_META.get(entity)!.CREATE;
        const editMeta = CUSTOM_FIELD_META.get(entity)!.EDIT;

        for (const addLocation of [true, false]) {
          await runCustomFieldLifecycle(customFieldsPage, meta, editMeta, {
            addLocation,
          });
        }
      }
    );
  }
});
