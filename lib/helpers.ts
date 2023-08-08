type TenderlyEnvVariables = {
  TENDERLY_ACCESS_KEY: string;
  TENDERLY_ACCOUNT_NAME: string;
  TENDERLY_PROJECT_NAME: string;
  TENDERLY_GET_BY_PROJECT_NAME: string;
};

export function getEnvironmentVariables() {
  return process.env as TenderlyEnvVariables;
}
