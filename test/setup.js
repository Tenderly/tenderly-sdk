/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');

module.exports = () => {
  try {
    console.log('###### ENV before setup: ', process.env.TENDERLY_ACCOUNT_NAME);
    dotenv.config();
    console.log('###### ENV after setup: ', process.env.TENDERLY_ACCOUNT_NAME);

    console.log('Jest setup successfull!');
  } catch (error) {
    console.error('Jest setup failed!', error);
  }
};
