import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import checkGis from './checkGis';
import checkOas from './checkOas';
import { RequestSchema, ResultOptions } from './types';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log(`Processing request: `, req.query);

  // validation
  const { error, value } = RequestSchema.validate(req.query);
  if (error) {
    context.res = {
      status: 400,
      body: {
        error: ResultOptions.INVALID,
        detail: error.details,
      },
    };
    context.log(error);
    return;
  }
  context.log('Passed validation.');

  // processing
  const resultOas = checkOas(value);
  context.log('OAS Result: ', resultOas);
  const resultGis = checkGis(value, resultOas.result);
  context.log('GIS Result: ', resultOas);

  // completion
  context.res = {
    status: 200,
    body: { oas: resultOas, gis: resultGis },
  };
};

export default httpTrigger;
