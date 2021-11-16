import Joi = require('joi');

export enum MaritalStatusOptions {
  SINGLE = 'Single',
  MARRIED = 'Married',
  COMMONLAW = 'Common-law',
  WIDOWED = 'Widowed',
  DIVORCED = 'Divorced',
  SEPERATED = 'Seperated',
}

export enum LegalStatusOptions {
  CANADIAN_CITIZEN = 'Canadian Citizen',
  PERMANENT_RESIDENT = 'Permanent Resident',
  STATUS_INDIAN = 'Status Indian',
  TEMPORARY_RESIDENT = 'Temporary Resident',
}

export const RequestSchema = Joi.object({
  age: Joi.number().integer().required(),
  livingCountry: Joi.string(),
  birthCountry: Joi.string(),
  yearsInCanadaSince18: Joi.number().integer(),
  inCountryWithAgreement: Joi.boolean(),
  maritalStatus: Joi.string().valid(...Object.values(MaritalStatusOptions)),
  legalStatus: Joi.string().valid(...Object.values(LegalStatusOptions)),
});

export interface CalculationParams {
  age?: number;
  livingCountry?: string;
  yearsInCanadaSince18?: number;
  inCountryWithAgreement?: boolean;
  maritalStatus?: MaritalStatusOptions;
  legalStatus?: LegalStatusOptions;
}

export interface CalculationResult {
  result: ResultOptions;
  reason: ResultReasons;
  detail: String;
}

export enum ResultOptions {
  ELIGIBLE = `Eligible!`,
  ELIGIBLE_WHEN_65 = `Eligible when 65.`,
  INELIGIBLE = `Ineligible!`,
  CONDITIONAL = `Conditionally eligible...`,
  MORE_INFO = 'Need more information...',
  INVALID = 'Request is invalid!',
}

export enum ResultReasons {
  NONE = `You meet the criteria`,
  AGE = `Not yet 65`,
  YEARS_IN_CANADA = `Not enough years in Canada`,
  CITIZEN = `Not a Canadian citizen`,
  SOCIAL_AGREEMENT = 'Not in a country with a social agreement',
  MORE_INFO = 'Need more information...',
  OAS='Not eligible for OAS'
}
