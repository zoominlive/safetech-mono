const { DB, USER, PASSWORD, HOST, DIALECT } = require('./use_env_variable');

module.exports = {
  development: {
    username: USER || 'root',
    password: PASSWORD || null,
    database: DB || 'safetech',
    host: HOST || '127.0.0.1',
    dialect: DIALECT || 'mysql',
  },
  test: {
    username: USER || 'root',
    password: PASSWORD || null,
    database: DB || 'safetech',
    host: HOST || '127.0.0.1',
    dialect: DIALECT || 'mysql',
  },
  production: {
    username: USER || 'root',
    password: PASSWORD || null,
    database: DB || 'safetech',
    host: HOST,
    dialect: DIALECT || 'mysql',
  },
};