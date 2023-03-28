import { GeneralError } from './GeneralError';

export class InvalidConstructorParametersError extends GeneralError {
  constructor() {
    super({
      id: 'local_error',
      message:
        'Missing configuration parameters. Please provide accessKey, accountName, projectName and network.',
      slug: 'invalid_constructor_parameters',
    });
  }
}
