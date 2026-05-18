#pragma once

#include "display_driver.h"

class SSD1327 : public DisplayDriver
{
public:
    SSD1327(const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle);
    bool initRaw() override;
    void pushRaw() override;

private:
    static constexpr gpio_num_t PIN_MOSI = GPIO_NUM_1;
    static constexpr gpio_num_t PIN_CLK = GPIO_NUM_9;
    static constexpr gpio_num_t PIN_DC = GPIO_NUM_10;
    static constexpr gpio_num_t PIN_CS = GPIO_NUM_11;
    static constexpr gpio_num_t PIN_RST = GPIO_NUM_14;

    static void send(uint8_t value, bool isData);
};
