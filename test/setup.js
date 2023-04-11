/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');

module.exports = () => {
  try {
    dotenv.config();

    console.log('Jest setup successfull!');
  } catch (error) {
    console.error('Jest setup failed!', error);
  }
};
