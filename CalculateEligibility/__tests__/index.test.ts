import {
  createHttpTrigger,
  runStubFunctionFromBindings,
} from 'stub-azure-function-context';
import httpTrigger from '../index';
import { CalculationParams, ResultOptions } from '../types';

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
});

async function mockedRequestFactory(params: CalculationParams) {
  return runStubFunctionFromBindings(
    httpTrigger,
    [
      {
        type: 'httpTrigger',
        name: 'req',
        direction: 'in',
        data: createHttpTrigger(
          'GET',
          'http://example.com',
          {},
          {},
          undefined,
          params
        ),
      },
      { type: 'http', name: 'res', direction: 'out' },
    ],
    new Date()
  );
}
