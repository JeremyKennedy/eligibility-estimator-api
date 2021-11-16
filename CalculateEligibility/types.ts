import Joi = require('joi');

export const RequestSchema = Joi.object({
  age: Joi.number().integer().required(),
  livingCountry: Joi.string(),
  birthCountry: Joi.string(),
  canadianCitizen: Joi.boolean(),
  yearsInCanada: Joi.number().integer(),
  inCountryWithAgreement: Joi.boolean(),
});

export interface CalculationParams {
  age?: number;
  canadianCitizen?: boolean;
  yearsInCanada?: number;
  inCountryWithAgreement?: boolean;
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
