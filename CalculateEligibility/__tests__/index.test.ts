import httpTrigger, { CalculationParams } from '../index';
import {
  runStubFunctionFromBindings,
  createHttpTrigger,
} from 'stub-azure-function-context';

describe('eligibility estimator api', () => {
  it('fails on blank request', async () => {
    const { res } = await mockedRequestFactory({});
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual('Request is invalid!');
  });

  it('needs more infomation when only age provided', async () => {
    const { res } = await mockedRequestFactory({ age: 64 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual('Need more information...');
  });

  it('returns ineligible when age below 64', async () => {
    const { res } = await mockedRequestFactory({ age: 63 });
    expect(res.status).toEqual(200);
    expect(res.body.result).toEqual('Not eligible!');
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
