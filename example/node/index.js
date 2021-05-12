const { createClient } = require('microcms-js-sdk');

const client = createClient({ serviceDomain: 'service-domain', apiKey: 'api-key' });

client
  .get({
    endpoint: 'hello',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
