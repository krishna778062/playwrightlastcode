export interface ISurveyManagementService {
  deleteSurvey(surveyId: string): Promise<void>;
}
