const { createClient } = require('microcms-js-sdk');

const config = {
  serviceDomain: 'service-domain',
  apiKey: 'api-key',
};

module.exports = {
  client: createClient(config),
};
