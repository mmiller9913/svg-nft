const networkConfig = {
    31337: {
        name: 'localhost',
        //if not on local chain, need keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        //don't need linkToken & vrfCoordinator address b/c these were depployed in mocks 
        keyHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
        fee: '100000000000000000' //0.1 LINK to WEI/JUELS
    },
    4: {
        name: 'rinkeby',
        //if not on local chain (i.e, using Rinkeby), need linkTokenAddress. vrfCoordinatorAddress, keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        linkToken: '0x01BE23585060835E02B77ef475b0Cc51aA1e0709',
        vrfCoordinator: '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
        keyHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
        fee: '100000000000000000' //0.1 LINK to WEI/JUELS
    }, 
    42: {
        name: 'kovan',
        //if not on local chain (i.e, using Rinkeby), need linkTokenAddress. vrfCoordinatorAddress, keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        linkToken: '0xa36085F69e2889c224210F603D836748e7dC0088',
        vrfCoordinator: '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9',
        keyHash: '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
        fee: '100000000000000000' //0.1 LINK to WEI/JUELS
    }, 
    137: {
        name: 'polygon',
        //if not on local chain (i.e, using Rinkeby), need linkTokenAddress. vrfCoordinatorAddress, keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        linkToken: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
        vrfCoordinator: '0x3d2341ADb2D31f1c5530cDC622016af293177AE0',
        keyHash: '0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da',
        fee: '100000000000000' //0.0001 LINK to WEI/JUELS
    }
}

module.exports = {
    networkConfig
}