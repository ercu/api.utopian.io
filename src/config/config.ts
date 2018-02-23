import * as Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
      .allow(['development', 'production', 'test', 'provision'])
      .default('development'),
  SERVER_PORT: Joi.number().default(4040),
  SERVER_SSL_CERT: Joi.string().allow('').default(''),
  SERVER_SSL_KEY: Joi.string().allow('').default(''),
  MONGOOSE_DEBUG: Joi.boolean()
      .when('NODE_ENV', {
        is: Joi.string().equal('development'),
        then: Joi.boolean().default(true),
        otherwise: Joi.boolean().default(false)
      }),
  STEEM_NODE: Joi.string().default('https://api.steemit.com'),
  STEEMCONNECT_HOST: Joi.string().default('https://v2.steemconnect.com'),
  MONGO_HOST: Joi.string().required()
      .description('Mongo DB host url'),
  UTOPIAN_GITHUB_SECRET: Joi.string().required(),
  UTOPIAN_GITHUB_CLIENT_ID: Joi.string().required(),
  UTOPIAN_GITHUB_REDIRECT_URL: Joi.string().required(),
  UTOPIAN_STEEMCONNECT_SECRET: Joi.string().required(),
  UTOPIAN_TAG: Joi.string().default('utopian-io'),
  UTOPIAN_DOMAIN: Joi.string().default('utopian.io'),
  UTOPIAN_SITE_NAME: Joi.string().default('Utopian.io'),
  UTOPIAN_ACCOUNT: Joi.string().default('Utopian-io'),
  UTOPIAN_COMMUNITY_NAME: Joi.string().default('utopian'),
  UTOPIAN_METADATA_APP_NAME: Joi.string().default('utopian'),
  UTOPIAN_METADATA_APP_VERSION: Joi.string().default('1.0.0'),



}).unknown()
    .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface Server {
  port: number;
  cert?: string;
  key?: string;
}

interface Credentials {
  githubSecret: string;
  githubClientId: string;
  steemConnectSecret: string;
}

interface Config {
  env: string;
  steemNode: string;
  steemconnectHost: string;
  mongooseDebug: boolean;
  mongo: string;
  server: Server;
  credentials: Credentials;
  app: string;
}

const config: Config = {
  env: envVars.NODE_ENV,
  steemNode: envVars.STEEM_NODE,
  steemconnectHost: envVars.STEEMCONNECT_HOST,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  credentials: {
    githubSecret: envVars.UTOPIAN_GITHUB_SECRET,
    githubClientId: envVars.UTOPIAN_GITHUB_CLIENT_ID,
    steemConnectSecret: envVars.UTOPIAN_STEEMCONNECT_SECRET,
  },
  mongo: envVars.MONGO_HOST,
  server: {
    port: envVars.SERVER_PORT,
    cert: envVars.SERVER_SSL_CERT,
    key: envVars.SERVER_SSL_KEY
  },
  app: envVars.UTOPIAN_METADATA_APP_NAME + '/' + envVars.UTOPIAN_METADATA_APP_VERSION,
};

export default config;
