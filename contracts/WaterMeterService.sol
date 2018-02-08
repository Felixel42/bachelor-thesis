pragma solidity^0.4.13;
/**
    @title WaterMeterService
    @author Felix Böer
    @dev contract to store the send of a smart water meter and manage payments
*/
contract WaterMeterService {
    struct Bill {
        uint16 year;
        uint8 month;
        uint consumption;
        uint amount;
        bool payed;
    }
    mapping(uint => Bill) private bills;
    uint private funds = 0;
    uint private numberOfBillings = 0;

    address private waterMeter;
    address private waterProvider;
    address private customer;
    uint private price;
    uint[] private dates;


    mapping(uint16 => mapping(uint8 => mapping(uint8 => mapping(uint8 => uint)))) private meterReadings;

    // check if sender is authorized to call the function
    modifier onlyBy(address account) {
        require(msg.sender == account);
        _;
    }

    function WaterMeterService(address _waterMeter, address _waterProvider, address _customer, uint _price, uint[] _dates) {
        waterMeter = _waterMeter;
        waterProvider = _waterProvider;
        customer = _customer;
        price = _price;
        dates = _dates;
    }

    function updateWaterMeterValue(uint16 year, uint8 month, uint8 day, uint8 hour, uint newMeterValue) external onlyBy(waterMeter) {
        meterReadings [year][month][day][hour] = newMeterValue;
    }

    function getWaterMeterReading(uint16 year, uint8 month, uint8 day, uint8 hour) constant returns (uint) {
        return meterReadings [year][month][day][hour];
    }

    function getPrice() external constant returns (uint) {
        return price;
    }

    function getStartDate() external constant returns (uint, uint, uint) {
        return (dates[0], dates[1], dates[2]);
    }

    function getEndDate() external constant returns (uint, uint, uint) {
        return (dates[3], dates[4], dates[5]);
    }

    function getNumberOfBillings() external constant returns (uint) {
        return numberOfBillings;
    }

    function getBillForBillId(uint id) external constant returns (uint, uint, uint, uint, bool) {
        Bill memory bill = bills[id];
        return (bill.year, bill.month, bill.consumption, bill.amount, bill.payed);
    }

    function createBillForMonth (uint16 year, uint8 month, uint8 monthEndDate) external onlyBy(waterProvider) {
        uint startMeterValue = getWaterMeterReading(year, month, 1, 0);
        uint endMeterValue = getWaterMeterReading(year, month, monthEndDate, 23);
        uint consumption = endMeterValue - startMeterValue;
        uint amount = consumption * price;
        numberOfBillings++;
        bills[numberOfBillings] = Bill(year, month, consumption, amount, false);
    }

    function payForBill(uint id) payable external onlyBy(customer) {
        if (bills[id].payed == false && bills[id].amount >= msg.value) {
            funds += msg.value;
            bills[id].payed = true;
        } else {
            return;
        }
    }

    function withDrawFunds() onlyBy(waterProvider) {
        msg.sender.transfer(funds);
        funds = 0;
    }
}