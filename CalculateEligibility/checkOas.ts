import getIsAgreementCountry from './helpers/socialAgreement';
import {
  CalculationParams,
  CalculationResult,
  LegalStatusOptions,
  ResultOptions,
  ResultReasons,
} from './types';

export default function checkOas(value: CalculationParams): CalculationResult {
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
  const inCountryWithAgreement = value.livingCountry
    ? getIsAgreementCountry(value.livingCountry)
    : undefined;

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
    inCountryWithAgreement &&
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
  } else if (inCountryWithAgreement == false) {
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
