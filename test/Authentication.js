var Authentication = artifacts.require("./Authentication.sol");

contract('Authentication', function (accounts) {
    var owner = accounts[0];
    var customer1 = {
        name: "Huber",
        address: accounts[1],
        someAddress: '0x0318247cb34f134f3cf49e97647227dc2d75abe8'
    };
    var customer2 = {
        name: "Müller",
        address: accounts[2],
        someAddress: '0x0318247cb34f134f3cf49e97647227dc2d75abe8'
    };
    var customer3 = {
        name: "Seehofer",
        address: accounts[3],
        someAddress: '0x0318247cb34f134f3cf49e97647227dc2d75abe8'
    };    

    it("Should retrieve deployed contract", function (done) {
        Authentication.deployed().then(function(instance) {
            // Pass test if the object is returned/deployed successfully 
            assert.isOk(Authentication);
            done();
        });
    });

    it("Should get right credentials of owner", function () {
        return Authentication.deployed().then(function(instance) {
            return instance.login();
        }).then(function(value) {
            //console.log(value.length)
            assert.equal(value[0], "admin", "Der zurückgegebene Name der Login Funktion war nicht admin")
            assert.equal(value[1], owner, "Die zurückgebene Adresse ist falsch")
        });
    });

    it("Should register new user correct and retrieve login credentials", function() {
        var savedInstance
        return Authentication.deployed().then(function(instance) {
            savedInstance = instance;
            return instance.getCurrentCustomerId();
        }).then(function(result) {
            assert.equal(result.valueOf(), 0, "customeriD should be zero initial");
        }).then(function() {
            return savedInstance.registerCustomer(customer1.name, customer1.address, customer1.someAddress);
        }).then(function() {
            return savedInstance.login({from: accounts[1]});
        }).then(function(value) {
            assert.equal(value[0], customer1.name, "Der zurückgegebene Name der Login Funktion war nicht richtig");
            assert.equal(value[1], customer1.address, "Die public adresse war falsch");
            assert.equal(value[2], customer1.someAddress, "Die contract adresse war falsch");
        });
    });

    it("Should register second user correct and retrieve login credentials", function() {
        var savedInstance
        return Authentication.deployed().then(function(instance) {
            savedInstance = instance;
            return instance.registerCustomer(customer2.name, customer2.address, customer2.someAddress);
        }).then(function() {
            return savedInstance.login({from: accounts[2]});
        }).then(function(value) {
            assert.equal(value[0], customer2.name, "Der zurückgegebene Name der Login Funktion war nicht richtig");
            assert.equal(value[1], customer2.address, "Die public adresse war falsch");
            assert.equal(value[2], customer2.someAddress, "Die contract adresse war falsch");
        });
    });

    it("Should register third user correct and retrieve login credentials", function() {
        var savedInstance
        return Authentication.deployed().then(function(instance) {
            savedInstance = instance;
            return instance.registerCustomer(customer3.name, customer3.address, customer3.someAddress);
        }).then(function() {
            return savedInstance.login({from: accounts[3]});
        }).then(function(value) {
            assert.equal(value[0], customer3.name, "Der zurückgegebene Name der Login Funktion war nicht richtig");
            assert.equal(value[1], customer3.address, "Die public adresse war falsch");
            assert.equal(value[2], customer3.someAddress, "Die contract adresse war falsch");
            return savedInstance.getCurrentCustomerId();
        }).then(function(result) {
            assert.equal(result.valueOf(), 3, "customeriD should be 3 after 3 initalizations initial");
        });
    }); 
    
    it("Should get right customer credentials for Ids", function() {
        var savedInstance
        return Authentication.deployed().then(function(instance) {
            savedInstance = instance;
            for (let i = 1; i < instance.getCurrentCustomerId().valueOf; i++) {
                value = instance.getCredentialsForCustomer(i);
                var string = "customer" + i

                assert.equal(value[0], string + ".name", "Der zurückgegebene Name der Login Funktion war nicht richtig");
                assert.equal(value[1], string + ".address", "Die public adresse war falsch");
                assert.equal(value[2], string + ".someAddress", "Die contract adresse war falsch");
            }
        });
    });

    it("Should trigger authenticate event with the same hash as transaction Hash", function() {        
        var savedInstance
        return Authentication.deployed().then(function(instance) {
            savedInstance = instance;
            return instance.authenticate();
        }).then(function(result) {
            var txHash = result.tx;
            var event = savedInstance.AuthenticationToken({from: web3.eth.accounts[0]});
            event.watch(function(error,result){
                assert.equal(result.transactionHash, txHash, "Hashes are not equal");
                event.stopWatching();
            });
        });
    });

    //TODO Test throws see: http://truffleframework.com/tutorials/testing-for-throws-in-solidity-tests 
});