const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CrowdFundedCampaignFactory.json');
const compiledCampaign = require('../ethereum/build/CrowdFundedCampaign.json');

let accounts;
let factoryContract;
let campaignAddress;
let campaignContract;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factoryContract = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
        data: compiledFactory.bytecode
    })
    .send({
        from: accounts[0],
        gas: '4000000'
    });

    // Ask the factory to deploy the campaign, specify minimum contribution
    await factoryContract.methods.launchCampaign('100')
        .send({
            from: accounts[0],
            gas: '1000000'
        });

    // Get the deployed contract address
    [campaignAddress] = await factoryContract.methods.getDeployedCampaignContracts()
        .call();

    console.log('Deployed contract', campaignAddress);

    // Load the deployed contract in memory
    campaignContract = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), 
        campaignAddress);
        
});

describe('Campaigns Tests', () => {
    
    it('Contracts Deployment Test', () => {
        // Checks that the value 'address' exists
        assert.ok(factoryContract.options.address);
        assert.ok(campaignContract.options.address);
    });

    it('Campaign Owner Validation Test', async () => {
        
        const campaignOwner = await campaignContract.methods.CampaignOwner()
            .call();

        // Checks that the value 'address' exists
        assert.equal(campaignOwner, accounts[0], 'The Creator of the Campaign is not the zero account');
    });

    it('Contributor Validation Test', async () => {
        
        const contributor = accounts[1];

        await campaignContract.methods.contribute()
            .send({
                from: contributor,
                value: 100,
                gas: '1000000'
            });

        // Get contributors
        const contributorExists = await campaignContract.methods.Contributors(contributor)
            .call();

        assert.ok(contributorExists, 'Contributor doesn\'t exist');
    });

    it('Low Contribution Test', async () => {

        try {
            await campaignContract.methods.contribute()
                .send({
                    from: accounts[1],
                    value: 99,
                    gas: '1000000'
                });
                
            assert(false, 'No error was thrown for low contribution.');
        }
        catch (err)
        {
            assert(err);
            console.log(err);
        }
    });

    it('Create Request Test', async () => {

        // Contribute
        await campaignContract.methods.contribute()
                .send({
                    from: accounts[1],
                    value: 1000,
                    gas: '1000000'
                });

        await campaignContract.methods.contribute()
            .send({
                from: accounts[2],
                value: 1000,
                gas: '1000000'
            });

        await campaignContract.methods.contribute()
            .send({
                from: accounts[3],
                value: 1000,
                gas: '1000000'
            });

        const vendorAddress = accounts[5];
        const originalBalance = await web3.eth.getBalance(vendorAddress);
        console.log('Original Balance', originalBalance);

        await campaignContract.methods.createRequest(vendorAddress, 'Pay account 5', 3000)
            .send({
                from: accounts[0],
                gas: '1000000'
            });
            
        // Approve
        await campaignContract.methods.approveRequest(1)
            .send({
                from: accounts[1],
                gas: '1000000'
            });

        await campaignContract.methods.approveRequest(1)
            .send({
                from: accounts[2],
                gas: '1000000'
            });

        let request = await campaignContract.methods.RequestsMap(1)
            .call();

        console.log(request);
        assert.equal(request.Description, 'Pay account 5');
        assert.equal(request.ApprovedCount, 2);

        await campaignContract.methods.finalizeRequest(1)
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        request = await campaignContract.methods.RequestsMap(1)
            .call();

        console.log(request);
        assert.ok(request.IsComplete);

        const newBalance = await web3.eth.getBalance(vendorAddress);
        console.log('New Balance', newBalance);
        assert.equal(parseInt(newBalance), (parseInt(originalBalance) + 3000));
    });
});
