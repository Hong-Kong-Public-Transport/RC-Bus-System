#include <Arduino.h>
#include <LittleFS.h>
#include <init_print.h>
#include <spi_slave.h>
#include <ssd1327.h>
#include <ssd1322.h>
#include <display_transaction_slave.h>
#include <stream_reader.h>

#define DISPLAY_DRIVER SSD1322
#define DISPLAY_ROTATED false
#define DISPLAY_HAS_WIPE true
#define DISPLAY_PIXELATED_TYPE 0

InitPrint initPrint("Display");
SPISlave spiSlave;
DISPLAY_DRIVER displayDriver(DISPLAY_ROTATED, DISPLAY_HAS_WIPE, DISPLAY_PIXELATED_TYPE);
DisplayTransactionSlave displayTransactionSlave;
StreamReader streamReader;

void spiTask(void *pvParameters)
{
	while (true)
	{
		spiSlave.tick();
		delay(1);
	}
}

void setup()
{
	Serial.begin(115200);
	Serial.println("");

	initPrint.init(LittleFS.begin(), "LittleFS");
	initPrint.init(spiSlave.init(), "SPI device");
	initPrint.init(displayDriver.init(), "Display driver");

	xTaskCreatePinnedToCore(spiTask, "SPI", 4096, NULL, 2, NULL, 0);
}

void loop()
{
	displayTransactionSlave.tick(&spiSlave, &streamReader, &displayDriver);
	delay(1);
}
