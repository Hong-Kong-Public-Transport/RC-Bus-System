#include "display_transaction_master.h"
#include "display_driver.h"

DisplayTransactionMaster::DisplayTransactionMaster(uint8_t displayIndex, uint32_t totalDisplayGroups) : displayIndex(displayIndex), totalDisplayGroups(totalDisplayGroups) {}

void DisplayTransactionMaster::nextDisplay(SPIMaster *spiMaster)
{
    if (currentGroup >= totalDisplayGroups)
    {
        currentGroup = 0;
    }

    spiMaster->send(displayIndex, currentGroup);
    currentGroup++;
}
