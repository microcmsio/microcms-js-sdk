const { createClient } = require('microcms-js-sdk');

const config = {
  serviceDomain: '',
  apiKey: '',
};

module.exports = {
  createClient() {
    return createClient(config);
  },
};
