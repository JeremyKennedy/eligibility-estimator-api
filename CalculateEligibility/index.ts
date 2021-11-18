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
  // helpers
  const canadianCitizen = value.legalStatus
    ? [
        LegalStatusOptions.CANADIAN_CITIZEN,
        LegalStatusOptions.PERMANENT_RESIDENT,
        LegalStatusOptions.STATUS_INDIAN,
        LegalStatusOptions.TEMPORARY_RESIDENT,
      ].includes(value.legalStatus)
    : undefined;

  const requiredYearsInCanada = value.livingCountry === 'Canada' ? 10 : 20;

  // main checks
  if (canadianCitizen && value.yearsInCanadaSince18 >= requiredYearsInCanada) {
    if (value.age >= 65) {
      return {
        result: ResultOptions.ELIGIBLE,
        reason: ResultReasons.NONE,
        detail: 'Based on the information provided, you are eligible for OAS!',
      };
    } else {
      return {
        result: ResultOptions.ELIGIBLE_WHEN_65,
        reason: ResultReasons.AGE,
        detail: 'You will be eligible when you turn 65.',
      };
    }
  } else if (
    value.inCountryWithAgreement &&
    value.yearsInCanadaSince18 < requiredYearsInCanada
  ) {
    return {
      result: ResultOptions.CONDITIONAL,
      reason: ResultReasons.YEARS_IN_CANADA,
      detail: 'Depending on the agreement.',
    };
  } else if (value.yearsInCanadaSince18 < requiredYearsInCanada) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.YEARS_IN_CANADA,
      detail: `Need to live in Canada more than ${requiredYearsInCanada} years.`,
    };
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
  // helpers
  const partnered =
    value.maritalStatus == MaritalStatusOptions.MARRIED ||
    value.maritalStatus == MaritalStatusOptions.COMMONLAW;

  // initial checks
  if (oasResult == ResultOptions.INELIGIBLE) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.OAS,
      detail: 'You need to be eligible for OAS to be eligible for GIS.',
    };
  } else if (
    oasResult == ResultOptions.MORE_INFO ||
    value.maritalStatus === undefined ||
    value.income === undefined ||
    (partnered && value.partnerReceivingOas === undefined)
  ) {
    return {
      result: ResultOptions.MORE_INFO,
      reason: ResultReasons.MORE_INFO,
      detail:
        'The information you have provided is not sufficient to provide an answer.',
    };
  } else if (!partnered && value.partnerReceivingOas) {
    return {
      result: ResultOptions.INVALID,
      reason: ResultReasons.INVALID,
      detail:
        'You can not be married/common law, and have a partner receiving OAS.',
    };
  }

  // determine max income
  let maxIncome = -1;
  if (partnered) {
    if (value.partnerReceivingOas) {
      maxIncome = 24048;
    } else {
      maxIncome = 43680;
    }
  } else {
    maxIncome = 18216;
  }

  // main checks
  if (value.income <= maxIncome) {
    if (value.age >= 65) {
      return {
        result: ResultOptions.ELIGIBLE,
        reason: ResultReasons.NONE,
        detail: 'Based on the information provided, you are eligible for GIS!',
      };
    } else {
      return {
        result: ResultOptions.ELIGIBLE_WHEN_65,
        reason: ResultReasons.AGE,
        detail: 'You will be eligible for GIS when you turn 65.',
      };
    }
  } else {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.INCOME,
      detail: 'Your income is too high to be eligible for GIS.',
    };
  }
}

export default httpTrigger;
