const path = require('path');

const envPath = path.join(__dirname, '../../.env');
const fs = require('fs');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.log('ℹ️  No .env file found, using system environment variables');
}

const MorganProd = {
  skip: function (req, res) {
    return res.statusCode < 400;
  },
};

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  DB: process.env.PGDATABASE,
  USER: process.env.PGUSER,
  PASSWORD: process.env.PGPASSWORD,
  HOST: process.env.PGHOST,
  DIALECT: 'postgres',
  JWT_SECRET: process.env.JWT_SECRET,  // From Replit secrets
  JWT_EXPIRESIN: process.env.JWT_EXPIRESIN || '7d',

  logType: process.env.NODE_ENV === 'development' ? 'dev' : 'combined', // Morgan logger for development & production
  morganConfig: process.env.NODE_ENV === 'development' ? {} : MorganProd, // Morgan Config for development & production

  EMAIL_FROM: process.env.EMAIL_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,  // From Replit secrets
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,  // Use same as above
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,  // From Replit secrets
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,  // Use same as above
  AWS_REGION: process.env.AWS_REGION || 'ca-central-1',
  AWS_BUCKET: process.env.AWS_S3_BUCKET || 'safetech-dev-images',

  NMI_SECURITY_KEY: process.env.NMI_SECURITY_KEY,
  NMI_SIGNING_KEY: process.env.NMI_SIGNING_KEY,

  TAX_API_KEY: process.env.TAX_API_KEY,

  FORTRESS_FIRE_EMAIL: process.env.FORTRESS_FIRE_EMAIL,
  FORTRESS_FIRE_PASSWORD: process.env.FORTRESS_FIRE_PASSWORD,
  FORTRESS_FIRE_URL: process.env.FORTRESS_FIRE_URL,
  FORTRESS_FIRE_SUBMITTER: process.env.FORTRESS_FIRE_SUBMITTER,

  REDIS_URL: process.env.REDIS_URL,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  ATTOM_API_URL: process.env.ATTOM_API_URL,
  ATTOM_API_KEY: process.env.ATTOM_API_KEY,

  HAZARD_API_URL: process.env.HAZARD_API_URL,
  HAZARD_API_TOKEN: process.env.HAZARD_API_TOKEN,

  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  MOBILE_APP_KEY: process.env.MOBILE_APP_KEY,  // From Replit secrets
};
