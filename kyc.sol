pragma solidity ^0.4.0;
contract kyc {
    address private verifier;
    mapping (address => bool) private bank;

    struct customer {
        uint lastUsedBank;
        mapping (address => uint) bankStatus;
        mapping(string => string) Documents; // symmetric key encryption of documents ipfs newhash
        mapping (address => string) key; // the key which encrypts the ipfs hash, is encrypted with the public key of the bank. so banks can decrypt this key and using it, it can also decrypt the ipfs hash.
    }
    
    event AskDocument(address askingBank, address customerAddress, address originalBank);
    
    mapping(address => customer) customers;

    constructor () public {
        verifier=msg.sender;
    }

    function addBank(address newBank) public {
        require(msg.sender == verifier,
            "Only verifier can add the new bank");
        bank[newBank]= true;
    }

    function checkBankRegistration( address bankAddress) private view returns (bool){
        return bank[bankAddress];
    }

    function checkBankStatus( address bankAddress, address customerAddress) private view returns (uint){
        return customers[customerAddress].bankStatus[bankAddress];
    }

    function consentConfirmation(address customerAddress) public{
        require(checkBankRegistration(msg.sender),
            "Only registered bank should be allowed to enter the consent");

        require(checkBankStatus(msg.sender, customerAddress)==2,
            "The bank should be in pending state for that particular customer");

        customers[customerAddress].bankStatus[msg.sender]=1;

    }

    function consentInitiation(address bankAddress) public{
        require(checkBankRegistration(bankAddress),
            "Only registered bank should be allowed to enter the consent");

        customers[msg.sender].bankStatus[bankAddress]=2;
    }

    function revokeConsent(address bankAddress) public {
        require(checkBankRegistration(bankAddress),
            "Only registered bank should be allowed to enter the consent");

        customers[msg.sender].bankStatus[bankAddress]=0;

    }

    function recordData(address customerAddress, string keyhash , string documentType, string documentAddresshash ) public{
        require(checkBankRegistration(msg.sender),
            "Only registered bank should be allowed to record the data");

        require(checkBankStatus(msg.sender, customerAddress)==1,
            "The bank should be allowed to record data");
            
         require(customers[customerAddress].lastUsedBank==0,
            "this function should be called by home bank");
        customers[customerAddress].Documents[documentType]=documentAddresshash;
        customers[customerAddress].lastUsedBank++;
        customers[customerAddress].key[msg.sender]=keyhash;

    }
    
    function requestTransfer(address originalBank, address customerAddress) public{
        require(checkBankRegistration(msg.sender),
            "Only registered bank should be allowed to ask for kyc reports");
        
        require(checkBankRegistration(originalBank),
            "kyc report should be asked only from registered banks");
            
        require(checkBankStatus(msg.sender,customerAddress)==1,
            "the bank should be allowed to access kyc record");
            
        require(customers[customerAddress].lastUsedBank!=0,
            "since this is a request of transfer, asking banking should not be home bank");
        
        emit AskDocument(msg.sender, customerAddress, originalBank);
    }
    
    function GiveRecord(address receiverBank, address customerAddress, string keyhash) public{
        require(checkBankRegistration(msg.sender),
            "Only registered bank should be allowed to ask for kyc reports");
        
        require(checkBankRegistration(receiverBank),
            "kyc report should be asked only from registered banks");
            
        require(checkBankStatus(msg.sender,customerAddress)==1,
            "the bank should be allowed to access kyc record");
            
        require(checkBankStatus(receiverBank,customerAddress)==1,
            "the bank should be allowed to access kyc record");
        
        customers[customerAddress].lastUsedBank++;    
        customers[customerAddress].key[receiverBank]=keyhash;
    }
}
