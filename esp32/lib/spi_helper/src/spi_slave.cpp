#include "spi_slave.h"
#include "driver/spi_slave.h"
#include <vector>
#include <esp_heap_caps.h>

SPISlave::~SPISlave()
{
    // Free DMA buffers to prevent memory leak
    if (rxDmaBuffer)
    {
        heap_caps_free(rxDmaBuffer);
        rxDmaBuffer = nullptr;
    }

    if (txDmaBuffer)
    {
        heap_caps_free(txDmaBuffer);
        txDmaBuffer = nullptr;
    }
}

bool SPISlave::init()
{
    rxDmaBuffer = static_cast<uint8_t *>(heap_caps_calloc(CHUNK_SIZE, sizeof(uint8_t), MALLOC_CAP_DMA));
    txDmaBuffer = static_cast<uint8_t *>(heap_caps_calloc(CHUNK_SIZE, sizeof(uint8_t), MALLOC_CAP_DMA));

    if (!rxDmaBuffer || !txDmaBuffer)
    {
        return false;
    }

    spi_bus_config_t busConfig = {
        .mosi_io_num = PIN_MOSI,
        .miso_io_num = PIN_MISO,
        .sclk_io_num = PIN_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = CHUNK_SIZE,
    };

    spi_slave_interface_config_t slaveConfig = {
        .spics_io_num = PIN_CS_DISPLAY,
        .flags = 0,
        .queue_size = 3,
        .mode = 0,
    };

    messageQueue = xQueueCreate(3, sizeof(uint32_t *));
    return spi_slave_initialize(SPI2_HOST, &busConfig, &slaveConfig, SPI_DMA_CH_AUTO) == ESP_OK;
}

void SPISlave::tick()
{
    // Setup header transaction
    spi_slave_transaction_t headerTransaction = {
        .length = DATA_LENGTH * 8,
        .tx_buffer = txDmaBuffer,
        .rx_buffer = rxDmaBuffer,
    };

    // Receive header
    if (spi_slave_transmit(SPI2_HOST, &headerTransaction, portMAX_DELAY) != ESP_OK)
    {
        return;
    }

    uint32_t magicHeader = 0;
    uint32_t magicFooter = 0;
    uint32_t *data = new uint32_t[2];
    memcpy(&magicHeader, rxDmaBuffer, sizeof(magicHeader));
    memcpy(data, rxDmaBuffer + sizeof(uint32_t), sizeof(uint32_t) * 2);
    memcpy(&magicFooter, rxDmaBuffer + sizeof(uint32_t) * 3, sizeof(magicFooter));

    // Verify header and footer
    if (magicHeader != MAGIC_HEADER || magicFooter != MAGIC_FOOTER)
    {
        delete[] data;
        return;
    }

    Serial.println(String("Received SPI message for display ") + (data[0] + 1) + String(" and group ") + (data[1] + 1));

    if (xQueueSend(messageQueue, &data, 0) != pdPASS)
    {
        delete[] data;
    }
}
