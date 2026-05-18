#pragma once

#include "spi_master.h"

class DisplayTransactionMaster
{
public:
    DisplayTransactionMaster(uint8_t displayIndex, uint32_t totalDisplayGroups);
    void nextDisplay(SPIMaster *spiMaster);

private:
    const uint8_t displayIndex;
    const uint32_t totalDisplayGroups;
    uint32_t currentGroup = 0;
};
