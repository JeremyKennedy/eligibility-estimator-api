import { Context } from '@azure/functions';
import getIsAgreementCountry from './helpers/socialAgreement';
import {
  CalculationParams,
  CalculationResult,
  LegalStatusOptions,
  OasSchema,
  ResultOptions,
  ResultReasons,
} from './types';
import { validateRequestForBenefit } from './validator';

export default function checkOas(
  params: CalculationParams,
  context: Context
): CalculationResult {
  // validation
  const { result, value } = validateRequestForBenefit(
    OasSchema,
    params,
    context
  );
  // if the validation was able to return an error result, return it
  if (result) return result;

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
      detail:
        "Depending on Canada's agreement with this country, you may be eligible to receive the OAS pension.",
    };
  } else if (value.yearsInCanadaSince18 < requiredYearsInCanada) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.YEARS_IN_CANADA,
      detail: `You currently do not appear to be eligible for the OAS pension as you have indicated that you have not lived in Canada for the minimum period of time or lived in a country that Canada has a social security agreement with. However, you may be in the future if you reside in Canada for the minimum required number of years.`,
    };
  } else if (canadianCitizen == false) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.CITIZEN,
      detail:
        'You currently do not appear to be eligible for the OAS pension as you have indicated that you do not have legal status in Canada. However, you may be in the future if you obtain legal status. If you are living outside of Canada, you may be eligible for the OAS pension if you had legal status prior to your departure.',
    };
  } else if (inCountryWithAgreement == false) {
    return {
      result: ResultOptions.INELIGIBLE,
      reason: ResultReasons.SOCIAL_AGREEMENT,
      detail:
        'You currently do not appear to be eligible for the OAS pension as you have indicated that you have not lived in Canada for the minimum period of time or lived in a country that Canada has a social security agreement with. However, you may be in the future if you reside in Canada for the minimum required number of years.',
    };
  }
  // fallback
  throw new Error('should not be here');
}
