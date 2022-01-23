require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({ path: '.env' });
// require('@nomiclabs/hardhat-ethers') //see line 42 in 01_deploy_svg.js for note on this 

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
    },
  },
  //commented out and added below after we set up the mocks
  // solidity: "0.8.0",
  solidity: {
    compilers: [
      {version: "0.8.0"}
    ]
  },
  namedAccounts: {
    deployer: 0, //account 0 when deploying
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};
