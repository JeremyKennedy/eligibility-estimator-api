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

// this is what the API expects to receive
// don't forget to update OpenAPI!
export const RequestSchema = Joi.object({
  age: Joi.number().integer().max(150),
  livingCountry: Joi.string(),
  legalStatus: Joi.string().valid(...Object.values(LegalStatusOptions)),
  yearsInCanadaSince18: Joi.number()
    .integer()
    .ruleset.max(Joi.ref('age', { adjust: (age) => age - 18 }))
    .message('Years in Canada should be no more than age minus 18'),
  maritalStatus: Joi.string().valid(...Object.values(MaritalStatusOptions)),
  partnerReceivingOas: Joi.boolean(),
  income: Joi.number().integer(),
});

export const OasSchema = RequestSchema.concat(
  Joi.object({
    // TODO: don't require when income over X
    age: Joi.required(),
    livingCountry: Joi.required(),
    legalStatus: Joi.required(),
    yearsInCanadaSince18: Joi.required(),
  })
);

export const GisSchema = RequestSchema.concat(
  Joi.object({
    _oasEligible: Joi.string()
      .valid(...Object.values(ResultOptions))
      .required(),
    maritalStatus: Joi.when('_oasEligible', {
      not: Joi.valid(ResultOptions.INELIGIBLE),
      then: Joi.required(),
    }),
    partnerReceivingOas: Joi.boolean()
      .when('maritalStatus', {
        is: Joi.exist().valid(
          MaritalStatusOptions.MARRIED,
          MaritalStatusOptions.COMMONLAW
        ),
        then: Joi.required(),
        otherwise: Joi.boolean().falsy().valid(false),
      })
      .when('_oasEligible', {
        is: Joi.valid(ResultOptions.INELIGIBLE),
        then: Joi.optional(),
      }),
    income: Joi.when('_oasEligible', {
      not: Joi.valid(ResultOptions.INELIGIBLE),
      then: Joi.required(),
    }),
  })
);

export interface CalculationParams {
  age?: number;
  livingCountry?: string;
  legalStatus?: LegalStatusOptions;
  yearsInCanadaSince18?: number;
  maritalStatus?: MaritalStatusOptions;
  partnerReceivingOas?: boolean;
  income?: number;
  _oasEligible?: ResultOptions;
}

export interface CalculationResult {
  result: ResultOptions;
  reason: ResultReasons;
  detail: String;
  // TODO: use field names as type
  missingFields?: Array<String>;
}
