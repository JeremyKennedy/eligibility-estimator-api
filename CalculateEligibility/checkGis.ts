import {
  CalculationParams,
  CalculationResult,
  MaritalStatusOptions,
  ResultOptions,
  ResultReasons,
} from './types';

export default function checkGis(
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
