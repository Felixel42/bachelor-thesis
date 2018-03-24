#!/usr/bin/env python 3.4

# link to web3.py docs: http://web3py.readthedocs.io/en/latest/
# link to github: https://github.com/pipermerriam/web3.py
# docs https://github.com/pipermerriam/web3.py/issues/175

import json
import rlp
from web3 import Web3, HTTPProvider
from ethereum.transactions import Transaction

# Can be used to interact with a local Ethereum Client
class ClientGateway: 
    def __init__(self, smartContractAddress):
        # Connect to a running local Ethereum Client, which has to be started with the following options:
        # parity\geth --rpcapi 'eth,web3,personal' src: https://ethereum.stackexchange.com/questions/16917/unable-to-unlock-account-with-parity-and-web3-on-the-testnet
        # Otherwise it isn't possible to unlock the account and send transactions
        self.web3 = Web3(HTTPProvider('http://localhost:8545'))
        
        # Assume that there is only one address availabe at the client, which is the public address of the water meter
        self.address = self.web3.eth.accounts[0]
        # Set the default Address, wich is used to send Transactions
        self.web3.eth.defaultAccount = self.address

        # There must be a file with the name "abi.json" in the same directory as this file
        # This file must contain the Abi(interface) of the smart contract which can be generated with remix IDE: https://remix.ethereum.org/ or with solc
        file = open("abi.json","r")
        
        # Is needed to create a contract object of the deployed contract
        MyContract = self.web3.eth.contract(
            abi = json.load(file)
        )

        # close file
        file.close()

        # Save reference to the instantiated contract object 
        self.my_contract = MyContract(smartContractAddress)

        # Create a Dictonary (It is like a HashMap in other languages) to save transmitted readings
        # Is used for testing
        self.waterMeterReadings = dict()

    def transmitSmartMeterReading(self, time, reading):
        # Unlock/decrypt the private key of the user account to sign the transaction 
        self.web3.personal.unlockAccount(self.address, 'password')
        
        # creates and signs a transaction to call the function of the deployed Smart Contract
        txHash = self.my_contract.transact().updateWaterMeterValue(time.tm_year, time.tm_mon, time.tm_mday, time.tm_hour, reading)

        # print txHash to see Transaction in etherscan
        print(txHash)

        # inserts a new Key/Value Pair into to the MeterReading Dictionary
        # Key is a String in the following format: yyyymmddhh, key is the related reading
        self.waterMeterReadings[repr(time.tm_year) + repr(time.tm_mon) + repr(time.tm_mday) + repr(time.tm_hour)] = reading


# class to connect to the public Node provider Infura https://infura.io and send rawTransactions
class InfuraGateway: 
    def __init__(self, smartContractAddress, privateKey, meterAddress):
        # Connect to Infura with your API- Key
        # Example: https://github.com/pipermerriam/web3.py/issues/134
        # Link is different for all ethereum networks, API can be retrieved after registration on https://infura.io 
        # Example Address for rinkeby: https://rinkeby.infura.io/<key>
        self.web3 = Web3(HTTPProvider('https://kovan.infura.io/<key>'))
        
        # Save privatekey to sign Transaction 
        self.privateKey = privateKey
        # Save public address of sender to get actual nonce of the sender
        self.myAddress = meterAddress
        # address of the deployed smart contract
        self.smartContractAddress = smartContractAddress

        # load abi to be able to create the hex encoded data value for a rawTransaction
        # Abi.json must contain the abi of the smart contract
        file = open("abi.json","r")
        # Is needed to create a contract object of the deployed contract
        MyContract = self.web3.eth.contract(
            abi = json.load(file)
        )
        # close file
        file.close()

        # Save reference to the instantiated contract object 
        self.my_contract = MyContract(smartContractAddress)

        # Create a Dictonary (It is like a HashMap in other languages) to save transmitted readings
        # Is used for testing
        self.waterMeterReadings = dict()

    def transmitSmartMeterReading(self, year, month, day, hour, reading):
        # Encoding and preparing the transaction is based on: https://github.com/pipermerriam/web3.py/blob/master/web3/contract.py
        # Create hex encoded function signature with arguments
        # Guide on how the ABI encoding works https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI 
        # How to use the encodeABI method https://github.com/pipermerriam/web3.py/blob/8362ac17f5c4a839511f2efd9a45df8f80585ac6/tests/contracts/test_contract_method_abi_encoding.py
        hexMethodTransaction = self.my_contract.encodeABI('updateWaterMeterValue', [year, month, day, hour, reading])
        
        # the data field of the Transaction API has to be bytes encoded, see: https://github.com/ethereum/pyethereum/blob/develop/ethereum/transactions.py
        bytesData = Web3.toAscii(hexMethodTransaction)

        # How to create, sign and send a rawTransaction: http://web3py.readthedocs.io/en/latest/web3.eth.html 
        # Create a Ethereum Transaction in which the Smart Contract function will be called
        # Startgas needs to be estimated with remix before
        tx = Transaction(
            nonce = self.web3.eth.getTransactionCount(self.myAddress),
            gasprice = self.web3.eth.gasPrice,
            startgas = 150000,
            value = 0,
            to = self.smartContractAddress,
            data = bytesData,
        )

        # sign and convert a transaction to hex
        tx.sign(self.privateKey)
        raw_tx = rlp.encode(tx)
        raw_tx_hex = self.web3.toHex(raw_tx)

        # send transaction
        txHash = self.web3.eth.sendRawTransaction(raw_tx_hex)

        print(txHash)

        # inserts a new Key/Value Pair into to the MeterReading Dictionary
        # Key is a String in the following format: yyyymmddhh, key is the related reading
        self.waterMeterReadings[repr(year) + repr(month) + repr(day) + repr(hour)] = reading
