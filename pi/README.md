# Smart meter and gateway Pi

## Prerequisites

There are three different approaches (only the first two are possible at the moment) to set up the OS for the Pi:

1. Install normal [Raspbian OS](https://www.raspberrypi.org/downloads/raspbian/) with Jessie. (+) easy (-) no preinstalled ethereum clients and many unnecessary software packages like GUI, clientGateway is not usable

2. Use [EthRaspbian](https://github.com/diglos/pi-gen). (-) additional configuration is required to use newer client versions. (+) no unnecessary packages

3. **TODO**: Create Dockerfile

### EthRaspbian installation and upgrade

1. For the first installation follow the instructions on [github](https://github.com/diglos/pi-gen)

2. To update without trouble to newer supported client version of Ethraspbian follow [these](https://www.reddit.com/r/ethereum/comments/76pi6e/ethereum_on_arm_debian_packages_update_for/) instructions

3. [For experts] Update to any newer ARM version of [Parity](https://github.com/paritytech/parity) or [geth](https://github.com/ethereum/go-ethereum/releases). Following is suited for parity, geth is the same process

```bash
sudo apt-get update
sudo apt-get upgrade

// backup configuration files into home directory
sudo cp /etc/systemd/system/parity.service ~/
sudo cp /etc/parity/parity.conf ~/

// download parity arm binary
cd ~/
wget http://parity-downloads-mirror.parity.io/v1.7.0/armv7-unknown-linux-gnueabihf/parity_1.7.0_armhf.deb
sudo apt-get purge parity-rasp
sudo dpkg -i parity_1.7.0_armhf.deb
sudo cp parity.service /etc/systemd/system
Cd /etc und hier drin sudo mkdir parity
Cd ~ und sudo cp parity.conf /etc/parity
sudo systemctl daemon-reload

// only if needed: prevent autostart of client
crontab -e
add: @reboot sudo systemctl stop parity
```

## Smart meter

Bought [this](https://www.amazon.de/gp/product/B00QC6L3T8/ref=oh_aui_detailpage_o05_s00?ie=UTF8&psc=1) flow meter. It should be similiar to [Adafruit's](https://www.adafruit.com/product/828) version. Follow Adafruit Kegomatic's [guide](https://learn.adafruit.com/adafruit-keg-bot?view=all) for additional informations.

My python modules use [this](../docs/img/Water_Meter.png) wiring scheme, fritzing is also availabe in the docs folder.

## Read meter readings and Blockchain gateway

1. Install python dependencies

```bash
// if not already installed
sudo apt-get install python3
sudo apt-get install python3-pip
sudo apt-get install python-rpi.gpio
sudo apt-get install python3-rpi.gpio

pip3 install web3
// https://github.com/ethereum/pyethapp/issues/195 if any problems occur
pip3 install ethereum
```

2. Set url in gateway or go to 3. 
To use the InfuraGateway, a link with access token/api key and blockchain network is required to access Infura's endpoints. It is available from [Infura](https://infura.io/signup) for free. This line must be edited:

```python
self.web3 = Web3(HTTPProvider('https://kovan.infura.io/<key>'))
```

3. Set password to unlock an account, if clientGateway is used

```python
self.web3.personal.unlockAccount(self.address, 'password')
```

4. Initialize gateway in read_water_flow.py with secret values
**smartContractAddress**: Address of smart contract which was created by the admin of the water utility. Only if the meterAdress was specified initially

```python
self.blockchainGateway = InfuraGateway(smartContractAddress,privateKey,meterAddress)
```

5. Start the smart meter

```bash
python read_water_flow.py
```

Now it displays any measured water consumption in the shell. In addition, a transaction to invoke the method of the related smart contract will be triggered automatically every hour.

## Blockchain gateway faker

If you do not want to set up a raspberry pi, buy a flow meter and do wiring stuff only to send sample meter readings data to smart contract functions then the gateway faker is your friend. It can easily be used from the interactive shell in the same directory where the files are. Configurations are still required.

```bash
python3
>>>from blockchain_gateway_Faker import InfuraGateway
>>>iG = InfuraGateway(smartContractAddress, privateKey,meterAddress)
>>>iG.transmitSmartMeterReading(2017,12,18,19,75) //(yyyy,mm,dd,hh,liters)
```

## Other

The abi.json is required and was compiled from WaterMeterService.sol on another device or with RemixIDE because it can be tricky to set up solc on a raspberry.
