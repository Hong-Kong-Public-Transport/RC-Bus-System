#pragma once

#include "spi_device.h"
#include "stream_wrapper.h"
#include <SPI.h>

class SPIMaster : public SPIDevice
{
public:
    SPIMaster(gpio_num_t pinCS);
    static void initBus();
    bool init() override;
    void send(const uint8_t displayIndex, const uint32_t groupIndex);

private:
    static constexpr gpio_num_t PIN_CS_SD = GPIO_NUM_12;
    static constexpr uint32_t SPI_SPEED = 1000000;

    static SPIClass *spiBus;

    const gpio_num_t pinCS;
};
