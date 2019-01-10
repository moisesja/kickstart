import web3Wrapper from './web3';
import compiledFactory from './build/CrowdFundedCampaignFactory.json';

const contractAddress = '0xc73C3cc46679b0763012025B0c1EC23fA95ee558';
const factoryInstance = new web3Wrapper.eth.Contract(JSON.parse(compiledFactory.interface), 
    contractAddress);

export default factoryInstance;