pragma solidity ^0.4.25;

contract CrowdFundedCampaign {
    
    address public CampaignOwner;
    uint public MinimumContribution;
    mapping (address => bool) public Contributors;
    uint public contributorCount;
    
    struct Request {
        uint Id;
        address VendorAddress;
        string Description;
        uint Amount;
        bool IsComplete;
        uint ApprovedCount;
        mapping (address => bool) Voters;
    }
    
    uint private _requestCounter;
    mapping (uint => Request) public RequestsMap;
    
    
    modifier onlyCampaignOwner {
        
        require(msg.sender == CampaignOwner, 'Only the Campaign Owner can make requests.');
        
        // Necessary construct. It's a placeholder for the compiler to inject all the
        // body of the calling function
        _;
    }
    
    modifier mustHaveFunds {
        
        require(address(this).balance > 0, 'The Campaign does not have any funds.');
        
        // Necessary construct. It's a placeholder for the compiler to inject all the
        // body of the calling function
        _;
    }
    
    modifier onlyContributor {
        
        require(Contributors[msg.sender], 'Only a campaign contributor can approve the request.');
        
        // Necessary construct. It's a placeholder for the compiler to inject all the
        // body of the calling function
        _;
    }
    
    constructor(uint minContribution, address campaignOwner) public {
        MinimumContribution = minContribution;
        //CampaignOwner = msg.sender;
        CampaignOwner = campaignOwner;
    }
    
    function contribute() public payable {
        require(msg.value >= MinimumContribution, 'You must meet the minimum contribution to participate');
        Contributors[msg.sender] = true;
        contributorCount++;
    }
    
    function createRequest(address vendorAddress, string description,
        uint amount) public onlyCampaignOwner mustHaveFunds {
            
        require(amount <= address(this).balance, 'The requested amount is exceeding available funds');
        
        Request memory request = Request({
               Id : _requestCounter + 1,
               VendorAddress: vendorAddress,
               Description: description,
               Amount: amount,
               IsComplete: false,
               ApprovedCount: 0
        });
        
        RequestsMap[request.Id] = request;
        _requestCounter++;
    }
    
    function approveRequest(uint requestId) public onlyContributor {
        
        Request storage request = RequestsMap[requestId];
        require(request.Id > 0, 'The request Id must be valid.');
        
        // Has the person voted?
        require(request.Voters[msg.sender] == false, 'This contributor has already voted.');
        
        // Say Yay
        request.ApprovedCount++;
        
        // Record voted
        request.Voters[msg.sender] = true;
    }
    
    function finalizeRequest(uint requestId) public onlyCampaignOwner {
    
        require(request.Id > 0, 'The request Id must be valid.');
        
        Request storage request = RequestsMap[requestId];
        require(!request.IsComplete, 'The request has already been finalized.');
        
        require((contributorCount / 2) < request.ApprovedCount, 'The majority must approve the request.');
        
        // Pay 
        request.VendorAddress.transfer(request.Amount);
        
        request.IsComplete = true;
    }
}