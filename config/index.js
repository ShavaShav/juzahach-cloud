module.exports = {
  // JWT - Use environment variable in production!
  JWT_SECRET: process.env.JWT_SECRET || 'super secret',

  // Port for user application API
  PORT: process.env.PORT || 3001,
  // Port for edge device API
  EDGE_PORT: process.env.EDGE_PORT || 3002,
};