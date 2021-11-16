import {
  LegalStatusOptions,
  MaritalStatusOptions,
  ResultOptions,
  ResultReasons,
} from '../types';
import { mockedRequestFactory } from './factory';

describe('sanity checks', () => {
  it('fails on blank request', async () => {
    const { res } = await mockedRequestFactory({});
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });
  it('accepts valid Marital Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.SINGLE,
    });
    expect(res.status).toEqual(200);
  });
  it('accepts valid Legal Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
  });
});

describe('basic scenarios', () => {
  it('returns "needs more infomation" when only age 65 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 65 });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "needs more infomation" when only age 64 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 64 });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "ineligible" when not citizen', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.TEMPORARY_RESIDENT,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.CITIZEN);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.OAS);
  });
  it('returns "ineligible" when country has no social agreement', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      inCountryWithAgreement: false,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.SOCIAL_AGREEMENT);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.OAS);
  });
  it('returns "ineligible" when citizen and 19 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 19,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.OAS);
  });
  it('returns "conditionally eligible" when social agreement and under 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      inCountryWithAgreement: true,
      yearsInCanadaSince18: 19,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.CONDITIONAL);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible when 65" when age 55 and citizen and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
  });
  it('returns "eligible" when citizen and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
});

describe('thorough personas', () => {
  it('Miriam Krayem: eligible when 65', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      livingCountry: 'Canada',
      yearsInCanadaSince18: 30,
      maritalStatus: MaritalStatusOptions.DIVORCED,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
  });
  it('Adam Smith: eligible when 65', async () => {
    const { res } = await mockedRequestFactory({
      age: 62,
      livingCountry: 'Canada',
      yearsInCanadaSince18: 15,
      maritalStatus: MaritalStatusOptions.WIDOWED,
      legalStatus: LegalStatusOptions.PERMANENT_RESIDENT,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
  });
  it('Habon Aden: ineligible due to years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Not Canada',
      yearsInCanadaSince18: 18,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('Tanu Singh: eligible', async () => {
    const { res } = await mockedRequestFactory({
      age: 66,
      livingCountry: 'Canada',
      yearsInCanadaSince18: 65,
      maritalStatus: MaritalStatusOptions.MARRIED,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
});

describe('thorough extras', () => {
  it('returns "ineligible due to years in Canada" when living in Canada and 9 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      yearsInCanadaSince18: 9,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible" when living in Canada and 10 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      yearsInCanadaSince18: 10,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "ineligible due to years in Canada" when not living in Canada and 19 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Not Canada',
      yearsInCanadaSince18: 19,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible" when not living in Canada and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Not Canada',
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
});
