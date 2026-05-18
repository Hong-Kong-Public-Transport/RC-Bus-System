#pragma once

#include "spi_device.h"

class SPISlave : public SPIDevice
{
public:
    QueueHandle_t messageQueue = nullptr;

    ~SPISlave();
    bool init() override;
    void tick();

private:
    static constexpr uint32_t HARD_SIZE_CAP = CHUNK_SIZE * 256;
    static constexpr gpio_num_t PIN_CS_DISPLAY = GPIO_NUM_39;

    uint8_t *rxDmaBuffer = nullptr;
    uint8_t *txDmaBuffer = nullptr;
};
