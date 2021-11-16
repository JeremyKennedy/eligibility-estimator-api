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
  canadianCitizen: Joi.boolean(),
  yearsInCanadaSince18: Joi.number().integer(),
  inCountryWithAgreement: Joi.boolean(),
  maritalStatus: Joi.string().valid(...Object.values(MaritalStatusOptions)),
  legalStatus: Joi.string().valid(...Object.values(LegalStatusOptions)),
});

export interface CalculationParams {
  age?: number;
  canadianCitizen?: boolean;
  yearsInCanadaSince18?: number;
  inCountryWithAgreement?: boolean;
  maritalStatus?: MaritalStatusOptions;
  legalStatus?: LegalStatusOptions;
}

export interface CalculationResult {
  result: ResultOptions;
  detail: String;
}

export enum ResultOptions {
  NOT_ELIGIBLE = `Not eligible!`,
  ELIGIBLE = `Eligible!`,
  CONDITIONAL = `Conditionally eligible...`,
  MORE_INFO = 'Need more information...',
  INVALID = 'Request is invalid!',
}
