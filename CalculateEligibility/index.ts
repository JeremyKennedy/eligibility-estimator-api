import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import checkGis from './checkGis';
import checkOas from './checkOas';
import { RequestSchema, ResultOptions } from './types';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log(`Processing request: `, req.query);

    // validation
    let { error, value } = RequestSchema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    context.log('Passed validation.');

    // processing
    const resultOas = checkOas(value, context);
    context.log('OAS Result: ', resultOas);

    const resultGis = checkGis(value, resultOas.result, context);
    context.log('GIS Result: ', resultGis);

    const allFields = [
      ...Object.keys(value),
      ...(resultOas.missingFields ? resultOas.missingFields : []),
      ...(resultGis.missingFields ? resultGis.missingFields : []),
    ];

    // completion
    context.res = {
      status: 200,
      body: { oas: resultOas, gis: resultGis, allFields },
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: {
        error: ResultOptions.INVALID,
        detail: error.details || String(error),
      },
    };
    context.log(error);
    return;
  }
};

export default httpTrigger;
