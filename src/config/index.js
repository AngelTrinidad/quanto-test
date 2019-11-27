module.exports = {
  port: process.env.PORT || 3000,
  env: 'dev',
  connection_string: `mongodb+srv://client:MyS4fePas$@cluster-test-eqoaj.gcp.mongodb.net/quanto?retryWrites=true&w=majority`,
  jwt_seed: 'miclavesecreta',
  brcypt_salt_rounds: 10,
  log_level: 'debug'
}