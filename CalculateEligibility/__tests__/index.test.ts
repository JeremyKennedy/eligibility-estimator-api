import {
  LegalStatusOptions,
  MaritalStatusOptions,
  ResultOptions,
} from '../types';
import { mockedRequestFactory } from './factory';

describe('sanity tests and error handling', () => {
  it('fails on blank request', async () => {
    const { res } = await mockedRequestFactory({});
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });
  it('accepts valid Marital Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 64,
      maritalStatus: MaritalStatusOptions.SINGLE,
    });
    expect(res.status).toEqual(200);
  });
  it('accepts valid Legal Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 64,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
  });
});

describe('basic scenarios', () => {
  it('needs more infomation when only age provided', async () => {
    const { res } = await mockedRequestFactory({ age: 64 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.MORE_INFO);
  });

  it('returns ineligible when age below 64', async () => {
    const { res } = await mockedRequestFactory({ age: 63 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.NOT_ELIGIBLE);
  });

  it('returns ineligible when not citizen', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.TEMPORARY_RESIDENT,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.NOT_ELIGIBLE);
  });

  it('returns ineligible country has no social agreement', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      inCountryWithAgreement: false,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.NOT_ELIGIBLE);
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
  it('Miriam Krayem: ineligible due to age', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      yearsInCanadaSince18: 30,
      maritalStatus: MaritalStatusOptions.DIVORCED,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.NOT_ELIGIBLE);
  });
  it('Adam Smith: ineligible due to age', async () => {
    const { res } = await mockedRequestFactory({
      age: 62,
      yearsInCanadaSince18: 15,
      maritalStatus: MaritalStatusOptions.WIDOWED,
      legalStatus: LegalStatusOptions.PERMANENT_RESIDENT,
    });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual(ResultOptions.NOT_ELIGIBLE);
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
