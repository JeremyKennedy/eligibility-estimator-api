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
  NONE = 'None of the above',
}

export const RequestSchema = Joi.object({
  age: Joi.number().integer().max(150).required(),
  livingCountry: Joi.string(),
  birthCountry: Joi.string(),
  legalStatus: Joi.string().valid(...Object.values(LegalStatusOptions)),
  yearsInCanadaSince18: Joi.number().integer(),
  maritalStatus: Joi.string().valid(...Object.values(MaritalStatusOptions)),
  partnerReceivingOas: Joi.boolean(),
  income: Joi.number().integer(),
});

export interface CalculationParams {
  age?: number;
  livingCountry?: string;
  legalStatus?: LegalStatusOptions;
  yearsInCanadaSince18?: number;
  maritalStatus?: MaritalStatusOptions;
  partnerReceivingOas?: boolean;
  income?: number;
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
  OAS = 'Not eligible for OAS',
  INCOME = 'Income too high',
  INVALID = `Entered data is invalid`,
}
