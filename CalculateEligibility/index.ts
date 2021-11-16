import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  CalculationParams,
  CalculationResult,
  LegalStatusOptions,
  RequestSchema,
  ResultOptions,
} from './types';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log(`Processing request: `, req.query);

  // validation
  const { error, value } = RequestSchema.validate(req.query);
  if (error) {
    context.res = {
      status: 400,
      body: {
        error: ResultOptions.INVALID,
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
    status: 200,
    body: result,
  };
};

function getResult(value: CalculationParams): CalculationResult {
  const canadianCitizen = value.legalStatus
    ? [
        LegalStatusOptions.CANADIAN_CITIZEN,
        LegalStatusOptions.PERMANENT_RESIDENT,
      ].includes(value.legalStatus)
    : undefined;

  if (value.age < 65) {
    return {
      result: ResultOptions.NOT_ELIGIBLE,
      detail: 'Age is below 65.',
    };
  } else if (canadianCitizen || value.yearsInCanadaSince18 >= 20) {
    return {
      result: ResultOptions.ELIGIBLE,
      detail: 'Next, see if you are eligible for GIS!',
    };
  } else if (canadianCitizen == false) {
    return {
      result: ResultOptions.NOT_ELIGIBLE,
      detail: 'Not Canadian citizen.',
    };
  } else if (value.inCountryWithAgreement == false) {
    return {
      result: ResultOptions.NOT_ELIGIBLE,
      detail: 'Not in a country with a social security agreement.',
    };
  } else if (value.inCountryWithAgreement && value.yearsInCanadaSince18 < 20) {
    return {
      result: ResultOptions.CONDITIONAL,
      detail: 'Depending on the agreement.',
    };
  } else {
    return {
      result: ResultOptions.MORE_INFO,
      detail:
        'The information you have provided is not sufficient to provide an answer.',
    };
  }
}

export default httpTrigger;
