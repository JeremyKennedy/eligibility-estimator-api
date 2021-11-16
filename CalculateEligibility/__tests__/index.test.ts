import { ResultOptions } from '../types';
import { mockedRequestFactory } from './factory';

describe('eligibility estimator api', () => {
  it('fails on blank request', async () => {
    const { res } = await mockedRequestFactory({});
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });

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
      canadianCitizen: false,
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
