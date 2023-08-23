import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

import * as dotenv from 'dotenv';
const getEnvFilePath = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return '.development.env';
    case 'production':
      return '.production.env';
    case 'test':
      return '.test.env';
    default:
      return '.development.env';
  }
};
dotenv.config({ path: getEnvFilePath() });

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .trim()
    .valid('development', 'production', 'test')
    .required(),
  PORT: Joi.number().required(),
});

class JoiValidation {
  constructor(private readonly schema: ObjectSchema) {
    this.transform(this._loadEnvFromDotEnv());
  }

  private _loadEnvFromDotEnv() {
    const env = dotenv.config({ path: getEnvFilePath() });
    if (env.error) {
      throw new Error(
        `Failed to load environment variables from ${getEnvFilePath()}`,
      );
    }
    return Object.assign(
      {
        NODE_ENV: process.env.NODE_ENV,
      },
      env.parsed,
    );
  }

  transform(incoming: unknown) {
    const { value, error } = this.schema.validate(incoming);
    if (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }

    return value;
  }
}

let hasInitialized = false;
class Configuration {
  static initialize() {
    if (!hasInitialized) {
      console.log('Initializing configuration');
      new JoiValidation(validationSchema);
      hasInitialized = true;
      return;
    }

    throw new Error('Configuration already initialized');
  }
}
Configuration.initialize();

export class EnvironmentVariables {
  static getVariables() {
    return {
      app: {
        env: process.env.NODE_ENV,
        port: process.env.PORT,
      },
    };
  }
  static get(accessors: string) {
    const accessorsArray = accessors.split('.');

    let value = this.getVariables();
    for (const accessor of accessorsArray) {
      value = value[accessor];
    }

    return value;
  }
}
