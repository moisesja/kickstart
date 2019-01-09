pragma solidity ^0.4.25;

import "./CrowdFundedCampaign.sol";

contract CrowdFundedCampaignFactory {
    
    address[] private _deployedCampaigns;
    
    function launchCampaign(uint minimumContribution) public {
        require(minimumContribution > 0, 'The minimumContribution cannot be zero.');
        address launchedCampaign = new CrowdFundedCampaign(minimumContribution, msg.sender);
        _deployedCampaigns.push(launchedCampaign);
    }
    
    function getDeployedCampaignContracts() public view returns ( address[] ) {
        return _deployedCampaigns;
    }
}