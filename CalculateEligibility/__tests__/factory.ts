import * as stub from 'stub-azure-function-context';
import httpTrigger from '../index';
import { CalculationParams } from '../types';

export async function mockedRequestFactory(params: CalculationParams) {
  return stub.runStubFunctionFromBindings(
    httpTrigger,
    [
      {
        type: 'httpTrigger',
        name: 'req',
        direction: 'in',
        data: stub.createHttpTrigger(
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
