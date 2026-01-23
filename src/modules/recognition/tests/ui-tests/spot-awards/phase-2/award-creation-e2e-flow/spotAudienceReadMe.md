Spot Awards audience test data (set before running tests)
Location: `src/modules/recognition/config/recognitionConfig.ts`

- **Audience filter**
  - `appManagerName`, `endUserName` → audience = `recognition_automation_audience_do_not_delete`
  - `recognitionManagerName` → audience ≠ `recognition_automation_audience_do_not_delete` (not equal to this audience)

- **Department filter**
  - `appManagerName`, `endUserName` → department = `SDET`
  - `recognitionManagerName` → department ≠ `SDET` (not equal to this department)

- **Location filter**
  - `appManagerName`, `endUserName` → location = `Gurugram`
  - `recognitionManagerName` → location ≠ `Gurugram` (not equal to this location)
