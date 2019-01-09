
const HDWalletProvider = require('truffle-hdwallet-provider');

const Web3 = require('web3');
const compiledFactory = require('./build/CrowdFundedCampaignFactory.json');

const provider = new HDWalletProvider(
    'capital position corn surface snake danger magnet column warrior peace reduce pig',
    'https://rinkeby.infura.io/v3/025dd953be614e1daf927b33228ab54c');

const web3 = new Web3(provider);

const deploy = async() => {

    // Grab list of accounts
    const accounts = await web3.eth.getAccounts();

    console.log('Deploying contract using account', accounts[0]);

    const contract = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({
            data: '0x' + compiledFactory.bytecode
        })
        .send({
            //gas: '1000000',
            from: accounts[0]
        });

    console.log('Deployed contract at', contract.options.address);
    console.log('Contract ABI', compiledFactory.interface);

};

deploy();

provider.engine.stop();
