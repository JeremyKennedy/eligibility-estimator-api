import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import Joi = require('joi');

const schema = Joi.object({
  age: Joi.number().integer().required(),
  livingCountry: Joi.string(),
  birthCountry: Joi.string(),
  canadianCitizen: Joi.boolean(),
  yearsInCanada: Joi.number().integer(),
  inCountryWithAgreement: Joi.boolean(),
});

interface CalculationParams {
  age: number;
  canadianCitizen: boolean;
  yearsInCanada: number;
  inCountryWithAgreement: boolean;
}

interface CalculationResult {
  result: String;
  detail: String;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log(`Processing request: `, req.query);

  // validation
  const { error, value } = schema.validate(req.query);
  if (error) {
    context.res = {
      status: 400,
      body: {
        error: `Request is invalid!`,
        detail: error.details,
      },
    };
    context.log(error);
    return;
  }
  context.log('Passed validation.');

  // processing
  const result = getResult(value);
  context.log('Result: ', result);

  // completion
  context.res = {
    body: result,
  };
};

function getResult(value: CalculationParams): CalculationResult {
  if (value.age < 65) {
    return {
      result: `Not eligible!`,
      detail: 'Age is below 65.',
    };
  } else if (value.canadianCitizen || value.yearsInCanada >= 20)
    return {
      result: `Eligible!`,
      detail: 'Next, see if you are eligible for GIS!',
    };
  else if (value.canadianCitizen == false) {
    return {
      result: `Not eligible!`,
      detail: 'Not Canadian citizen.',
    };
  } else if (value.inCountryWithAgreement == false) {
    return {
      result: `Not eligible!`,
      detail: 'Not in a country with a social security agreement.',
    };
  } else if (value.inCountryWithAgreement && value.yearsInCanada < 20)
    return {
      result: `Conditionally eligible...`,
      detail: 'Depending on the agreement.',
    };
  else {
    return {
      result: 'Need more information...',
      detail:
        'The information you have provided is not sufficient to provide an answer.',
    };
  }
}

export default httpTrigger;
