import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import Joi = require('joi');

const schema = Joi.object({
  age: Joi.number().integer().required(),
});

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log(`Processing request: `, req.query);

  // validation
  const { error, value } = schema.validate(req.query);
  if (error) {
    context.res = {
      status: 400,
      body: { error: `Request is invalid!`, detail: error.details },
    };
    context.log(error);
    return;
  }
  context.log('Passed validation.');

  // processing
  // TODO...

  // completion
  context.res = {
    body: `Something worked! You provided: ${JSON.stringify(value)}`,
  };
};

export default httpTrigger;
