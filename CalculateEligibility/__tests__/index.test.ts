import {
  LegalStatusOptions,
  MaritalStatusOptions,
  ResultOptions,
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
  it('returns needs more infomation when only age 65 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 65 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.MORE_INFO);
  });

  it('returns needs more infomation when only age 64 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 64 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.MORE_INFO);
  });

  it('returns ineligible when not citizen', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.TEMPORARY_RESIDENT,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.INELIGIBLE);
  });

  it('returns ineligible when country has no social agreement', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      inCountryWithAgreement: false,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.INELIGIBLE);
  });

  it('returns conditionally eligible when social agreement and under 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      inCountryWithAgreement: true,
      yearsInCanadaSince18: 19,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.CONDITIONAL);
  });
});

describe('personas', () => {
  it('Miriam Krayem: eligible when 65', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      yearsInCanadaSince18: 30,
      maritalStatus: MaritalStatusOptions.DIVORCED,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
  });
  it('Adam Smith: eligible when 65', async () => {
    const { res } = await mockedRequestFactory({
      age: 62,
      yearsInCanadaSince18: 15,
      maritalStatus: MaritalStatusOptions.WIDOWED,
      legalStatus: LegalStatusOptions.PERMANENT_RESIDENT,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
  });
  it('Habon Aden: eligible', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      yearsInCanadaSince18: 18,
      maritalStatus: MaritalStatusOptions.SINGLE,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.ELIGIBLE);
  });
  it('Tanu Singh: eligible', async () => {
    const { res } = await mockedRequestFactory({
      age: 66,
      yearsInCanadaSince18: 65,
      maritalStatus: MaritalStatusOptions.MARRIED,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.ELIGIBLE);
  });
});
