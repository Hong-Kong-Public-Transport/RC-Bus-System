#include "spi_master.h"
#include <array>

SPIClass *SPIMaster::spiBus = nullptr;

SPIMaster::SPIMaster(gpio_num_t pinCS) : pinCS(pinCS) {}

void SPIMaster::initBus()
{
    if (!spiBus)
    {
        spiBus = new SPIClass(HSPI);
        spiBus->begin(PIN_CLK, PIN_MISO, PIN_MOSI, -1);
    }
}

bool SPIMaster::init()
{
    pinMode(pinCS, OUTPUT);
    digitalWrite(pinCS, HIGH);
    return true;
}

void SPIMaster::send(const uint8_t displayIndex, const uint32_t groupIndex)
{
    digitalWrite(pinCS, LOW);
    spiBus->beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    uint32_t headerPayload[] = {MAGIC_HEADER, displayIndex, groupIndex, MAGIC_FOOTER};
    spiBus->transferBytes((uint8_t *)headerPayload, nullptr, DATA_LENGTH);
    spiBus->endTransaction();
    digitalWrite(pinCS, HIGH);
}
