var WaterMeterService = artifacts.require("./WaterMeterService.sol")

/*
accounts[0] = waterMeter
accounts[1] = waterProvider
accounts[2] = customer
*/


contract('WaterMeterService', function (accounts) {
    var waterMeter = web3.eth.accounts[0];
    var waterProvider = web3.eth.accounts[1];
    var customer = web3.eth.accounts[2];
    
    // variable to store reference to deployed Contract
    // test case for retrieving the deployed contract
    it("Should retrive deployed contract", function (done) {
        // check if contract was deployed
        WaterMeterService.deployed().then(function (instance) {
                // Beispiel für logs console.log("water Meter Database", WaterMeterService)
            // Pass test if the object is returned/deployed successfully 
            assert.isOk(WaterMeterService);
            done();
        });
    });

    it("should retrieve initial price", function () {
        return WaterMeterService.deployed().then(function (instance) {
            return instance.getPrice({from: waterProvider});
        }).then(function (price) {
            assert.equal(price.valueOf(), web3.toWei(0.004, 'ether'), "0 wasn't the initial meter reading");
        });
    });

    it("should update the water meter reading by water meter and return a new value", function () {
        var savedInstance;
        return WaterMeterService.deployed().then(function (instance) {
            savedInstance = instance;
            return instance.updateWaterMeterValue(1,1,1,1,10, { from: waterMeter });
        }).then(function () {
            return savedInstance.getWaterMeterReading(1,1,1,1, { from: customer});
        }).then(function (WaterMeterReading) {
            assert.equal(WaterMeterReading.valueOf(), 10, "10 wasn't the initial meter reading");
        });
    });

    it("Should return correct start date", function () {
        var savedInstance;
        return WaterMeterService.deployed().then(function (instance) {
            savedInstance = instance;
            return instance.getStartDate();
        }).then(function (result) {
            assert.equal(result[0].valueOf(), 2017, "Anfangsjahr war nicht richitg");
            assert.equal(result[1].valueOf(), 9, "Anfangsmonat war nicht richtig");
            assert.equal(result[2].valueOf(), 10, "Anfangstag war nicht richtig");
        });
    });

    it("Should return correct end date", function () {
        var savedInstance;
        return WaterMeterService.deployed().then(function (instance) {
            savedInstance = instance;
            return instance.getEndDate();
        }).then(function (result) {
            assert.equal(result[0].valueOf(), 2017, "Endjahr war nicht richitg");
            assert.equal(result[1].valueOf(), 10, "Endmonat war nicht richtig");
            assert.equal(result[2].valueOf(), 17, "Endtag war nicht richtig");
        });
    });

    it("Should create Bill correctly", function () {
        var savedInstance;
        return WaterMeterService.deployed().then(function (instance) {
            savedInstance = instance;
            return instance.getNumberOfBillings();
        }).then(function (result) {
            assert.equal(result.valueOf(), 0, "Initial Number of Billings was not correct");
            return savedInstance.updateWaterMeterValue(2017,9,30,23,30, {from: waterMeter});        
        }).then(function(){
            return savedInstance.createBillForMonth(2017,9,30, {from: waterProvider})
        }).then(function () {
            return savedInstance.getNumberOfBillings();
        }).then (function(result) {
            assert.equal(result.valueOf(), 1, "Number of Billings wasn't updated");
            return savedInstance.getBillForBillId(1);
        }).then (function(result) {
            assert.equal(result[0].valueOf(), 2017, "Date of Bill is Incorrect");
            assert.equal(result[1].valueOf(), 9, "Month of Bill is incorrect");
            assert.equal(result[2].valueOf(), 30, "Consumption is wrong computated");
            assert.equal(result[3].valueOf(), web3.toWei(0.004, 'ether') * 30, "Owed Amount is wrong computated");
            assert.equal(result[4], false, "Wrong payed flag");
        });
    });

    it("Should pay Bill correctly", function () {
        var savedInstance;
        return WaterMeterService.deployed().then(function (instance) {
            savedInstance = instance;
            return instance.getBillForBillId(1)
        }).then(function(result) {
            return savedInstance.payForBill(1, {from: customer, value: result[3]});
        }).then(function() {
            return savedInstance.getBillForBillId(1);
        }).then(function(result) {
            assert.equal(result[4], true, "Wrong payed flag");
            return savedInstance.withDrawFunds({from: waterProvider});
        });
    });
});