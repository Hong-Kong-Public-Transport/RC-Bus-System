#include "display_transaction_slave.h"

void DisplayTransactionSlave::tick(SPISlave *spiSlave, StreamReader *streamReader, DisplayDriver *displayDriver)
{
    uint32_t *data = nullptr;
    if (xQueueReceive(spiSlave->messageQueue, &data, 0))
    {
        uint8_t displayIndex = data[0];
        uint32_t groupIndex = data[1];
        delete[] data;

        if (fileStreamWrapper.init(String("/display/display_") + (displayIndex + 1) + "/group_" + (groupIndex + 1)))
        {
            streamReader->init(&fileStreamWrapper);
            imageIndex = 0;
        }
    }

    uint32_t imageCount = streamReader->getImageCount();
    if (imageCount > 0 && streamReader->draw(displayDriver, imageIndex))
    {
        imageIndex = (imageIndex + 1) % imageCount;
    }
}
