export enum FormSuiteTags {
  FORM_CREATION = '@form-creation',
  FORM_E2E = '@form-e2e',
}

export enum FormFeatureTags {
  FORM_VERIFICATION = '@form-verification',
}

export const FormTestTags = [...Object.values(FormSuiteTags), ...Object.values(FormFeatureTags)] as const;

export default FormTestTags;
