import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  CalculationParams,
  CalculationResult,
  LegalStatusOptions,
  MaritalStatusOptions,
  RequestSchema,
  ResultOptions,
  ResultReasons,
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
  const resultOas = checkOas(value);
  context.log('OAS Result: ', resultOas);
  const resultGis = checkGis(value, resultOas.result);
  context.log('GIS Result: ', resultOas);

  // completion
  context.res = {
    status: 200,
    body: { oas: resultOas, gis: resultGis },
  };
};

function checkOas(value: CalculationParams): CalculationResult {
  const canadianCitizen = value.legalStatus
    ? [
        LegalStatusOptions.CANADIAN_CITIZEN,
        LegalStatusOptions.PERMANENT_RESIDENT,
      ].includes(value.legalStatus)
    : undefined;

  const requiredYearsInCanada = value.livingCountry === 'Canada' ? 10 : 20;

  if (canadianCitizen) {
    if (value.yearsInCanadaSince18 >= requiredYearsInCanada) {
      if (value.age >= 65) {
        return {
          result: ResultOptions.ELIGIBLE,
          reason: ResultReasons.NONE,
          detail: 'Next, see if you are eligible for GIS!',
        };
      } else {
        return {
          result: ResultOptions.ELIGIBLE_WHEN_65,
          reason: ResultReasons.AGE,
          detail: 'You will be eligible when you turn 65.',
        };
      }
    } else {
      return {
        result: ResultOptions.INELIGIBLE,
        reason: ResultReasons.YEARS_IN_CANADA,
        detail: `Need to live in Canada more than ${requiredYearsInCanada} years.`,
      };
    }
  } else if (canadianCitizen == false) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.CITIZEN,
      detail: 'Not Canadian citizen.',
    };
  } else if (value.inCountryWithAgreement == false) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.SOCIAL_AGREEMENT,
      detail: 'Not in a country with a social security agreement.',
    };
  } else if (
    value.inCountryWithAgreement &&
    value.yearsInCanadaSince18 < requiredYearsInCanada
  ) {
    return {
      result: ResultOptions.CONDITIONAL,
      reason: ResultReasons.YEARS_IN_CANADA,
      detail: 'Depending on the agreement.',
    };
  }
  // fallback
  return {
    result: ResultOptions.MORE_INFO,
    reason: ResultReasons.MORE_INFO,
    detail:
      'The information you have provided is not sufficient to provide an answer.',
  };
}

function checkGis(
  value: CalculationParams,
  oasResult: ResultOptions
): CalculationResult {
  if (oasResult == ResultOptions.INELIGIBLE) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.OAS,
      detail: 'You need to be eligible for OAS to be eligible for GIS.',
    };
  } else if (oasResult == ResultOptions.MORE_INFO) {
    return {
      result: ResultOptions.MORE_INFO,
      reason: ResultReasons.MORE_INFO,
      detail:
        'The information you have provided is not sufficient to provide an answer.',
    };
  } else if (
    value.maritalStatus == MaritalStatusOptions.MARRIED ||
    value.maritalStatus == MaritalStatusOptions.COMMONLAW
  ) {
  }
  // fallback
  return {
    result: ResultOptions.MORE_INFO,
    reason: ResultReasons.MORE_INFO,
    detail:
      'The information you have provided is not sufficient to provide an answer.',
  };
}

export default httpTrigger;
