#!/usr/bin/env python 3.4

# source for the code and logic of the main method: https://learn.adafruit.com/adafruit-keg-bot/raspberry-pi-code

import time
import math
import RPi.GPIO as GPIO
from blockchain_gateway import InfuraGateway

# GPIO Pin initialization, GPIO.BOARD layout matches the counted pin number
GPIO.setmode(GPIO.BOARD)
GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# class to seperate the existing Adafruit code from my additional code to work with the Blockchain Gateway
class SmartMeter:
    def __init__(self):
        self.totalMeterReading = 0
        self.initTime = time.localtime()
        self.lastSentTime = -1
        self.actualTime = time.localtime()
        # HashMap to store the readings for a certain time
        self.meterReadings = dict()
        # create InfuraGateway object with arguments in the following order: smartContractAddress, private key of the smart meter, public key of the smart meter
        self.blockchainGateway = InfuraGateway(smartContractAddress,privateKey,meterAddress)

    def checkAndTransmitReading(self):
        lastTime = self.actualTime
        self.actualTime = time.localtime()
        timeDiff = -1

        if(self.lastSentTime == -1): 
            timeDiff = (self.actualTime.tm_hour - self.initTime.tm_hour) % 24
        else:
            timeDiff = (self.actualTime.tm_hour - self.lastSentTime.tm_hour) % 24

        if((timeDiff >= 2 or (timeDiff >= 1 and self.lastSentTime == -1)) and lastTime.tm_hour != self.actualTime.tm_hour):
             # if a new hour has begun and the reading of the last time has not yet been transmitted 
            print("Entered transmit MeterReading State")

            # get reading for the time to send
            reading = self.getMeterReadingForTime(lastTime)
            # send reading to smart Contract
            self.blockchainGateway.transmitSmartMeterReading(lastTime, reading)
            
            # update lastSentTime
            self.lastSentTime = lastTime
    
    def createStringForTime(self, time):
        return repr(time.tm_year) + repr(time.tm_mon) + repr(time.tm_mday) + repr(time.tm_hour)

    def getMeterReadingForTime(self, time):
        return self.meterReadings[self.createStringForTime(time)]

    def updateMeterReading(self, reading):
        updateTime = time.localtime()
        self.totalMeterReading += reading
        self.meterReadings[self.createStringForTime(updateTime)] = self.totalMeterReading

    def getTotalMeterReading(self):
        return self.totalMeterReading


# this method is invoked with the start of the python file
def main():
    # initialize variables for measuring and to keep track of the current program state
    measuring = False
    waterFlow = False
    lastPinState = False
    pinState = 0
    lastPinChange = int(time.time() * 1000)
    flowStart = 0
    pinChange = lastPinChange
    pinDelta = 0
    hertz = 0
    flow = 0
    litersMeasured = 0
    
    # initialize a new SmartMeter Object
    smartMeter = SmartMeter()

    # main loop to detect water consumption und start measuring
    while True:
        # current start time in seconds
        currentTime = int(time.time() * 1000)

        if GPIO.input(7):
            pinState = True
        else:
            pinState = False
        
        if(pinState != lastPinState and pinState == True):
            # If the pin states changed from low to high
            if(measuring == False):
                print("Entered Measuring State")
                measureStart = currentTime
                measuring = True
            
            # get the current time
            pinChange = currentTime
            pinDelta = pinChange - lastPinChange

            if (pinDelta < 1000 and pinDelta > 0):
                # calculate the instantaneous speed
                hertz = 1000.0000 / pinDelta
                flow = hertz / (60 * 7.5) # L/s
                litersMeasured += flow * (pinDelta / 1000.0000)
                print("litersMeasured: " + repr(litersMeasured))

        if (measuring == True and pinState == lastPinState and (currentTime - lastPinChange) > 3000):
            # if for 3 seconds no water consumption was detected, add current measured flow data to current smartMeter.meterReading
            measuring = False

            if (litersMeasured > 0.1):
                # prohibits that wrongly measured data is added to meter reading

                print("Entered Update_MeterReading State")
                print("Old water meter reading: " + repr(smartMeter.getTotalMeterReading()))
                
                # round up measured liters for easier further calculations
                roundedLitersMeasured = math.ceil(litersMeasured)
               
                # updateMeterReading
                smartMeter.updateMeterReading(roundedLitersMeasured)
                print("New water meter reading: " + repr(smartMeter.getTotalMeterReading()))

                # reset temporary measure variable for measuring state
                litersMeasured = 0

                # method checks if a new meter reading for the last Hour is available 
                # if yes, a new meter reading will be sent to the Blockchain Gateway
                smartMeter.checkAndTransmitReading()

        # reset temporary variables for measuring state            
        lastPinChange = pinChange
        lastPinState = pinState

if __name__ == "__main__": main()