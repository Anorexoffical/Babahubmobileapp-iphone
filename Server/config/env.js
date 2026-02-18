const dotenvFlow = require('dotenv-flow');
const { cleanEnv, str, port, bool } = require('envalid');

// Load environment files according to NODE_ENV
// dotenvFlow.config({ node_env: process.env.NODE_ENV || 'development', path: __dirname + '/..' });
dotenvFlow.config({ node_env: process.env.NODE_ENV || 'production', path: __dirname + '/..' });


const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: process.env.NODE_ENV || 'development' }),
  PORT: port({ default: 3001 }),
  MONGODB_URI: str(),
  CORS_ALLOWED_ORIGINS: str({ default: 'http://localhost:3001,http://localhost:5173' }),

  // PayFast
  PAYFAST_MERCHANT_ID: str(),
  PAYFAST_MERCHANT_KEY: str(),
  PAYFAST_PASSPHRASE: str(),
  PAYFAST_RETURN_URL: str(),
  PAYFAST_CANCEL_URL: str(),
  PAYFAST_NOTIFY_URL: str(),
  PAYFAST_SANDBOX: bool({ default: false }),
});

// Do not mutate the CleanEnv object; export a plain config object
const cfg = {
  ...env,
  PAYFAST_PROCESS_HOST: env.PAYFAST_SANDBOX ? 'sandbox.payfast.co.za' : 'www.payfast.co.za',
};

module.exports = cfg;