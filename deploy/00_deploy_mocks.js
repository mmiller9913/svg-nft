module.exports = async({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, log } = deployments;

    //getNamedAccounts looks in hardhat.config for named accounts 
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    if (chainId == 31337) {
        log('Local network detected, deploying mocks');
        //see test folder, that's where LinkToken is
        const LinkToken = await deploy('LinkToken', {
            from: deployer,
            log: true
        })
        //see test folder, that's where VRFCoordinatorMock is 
        const VRFCoordinatorMock = await deploy('VRFCoordinatorMock', {
            from: deployer,
            log: true,
            //note here - https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/deploy/00_Deploy_Mocks.js
            //needs args w/ address 
            args: [LinkToken.address]
        })
        log('Mocks deployed')
    }
}

//the below makes it so, when running something like "npx hardhat deploy --tags svg", only files that have this export tag are run
//or npx hardhat deploy --tags all
//or npx hardhat deploy --tags rsvg
module.exports.tags = ['all', 'rsvg', 'svg']