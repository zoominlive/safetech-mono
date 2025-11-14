const { DB, USER, PASSWORD, HOST, DIALECT } = require('./use_env_variable');

module.exports = {
  development: {
    username: USER || 'root',
    password: PASSWORD || null,
    database: DB || 'safetech',
    host: HOST || '127.0.0.1',
    dialect: DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  },
  test: {
    username: USER || 'root',
    password: PASSWORD || null,
    database: DB || 'safetech',
    host: HOST || '127.0.0.1',
    dialect: DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
};