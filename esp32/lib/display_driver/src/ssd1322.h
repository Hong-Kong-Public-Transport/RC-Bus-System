#pragma once

#include "display_driver.h"

class SSD1322 : public DisplayDriver
{
public:
    SSD1322(const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle);
    bool initRaw() override;
    void pushRaw() override;

private:
    static constexpr gpio_num_t PIN_D0 = GPIO_NUM_1;
    static constexpr gpio_num_t PIN_D1 = GPIO_NUM_2;
    static constexpr gpio_num_t PIN_D2 = GPIO_NUM_3;
    static constexpr gpio_num_t PIN_D3 = GPIO_NUM_4;
    static constexpr gpio_num_t PIN_D4 = GPIO_NUM_5;
    static constexpr gpio_num_t PIN_D5 = GPIO_NUM_6;
    static constexpr gpio_num_t PIN_D6 = GPIO_NUM_7;
    static constexpr gpio_num_t PIN_D7 = GPIO_NUM_8;

    static constexpr gpio_num_t PIN_WR = GPIO_NUM_9;
    static constexpr gpio_num_t PIN_DC = GPIO_NUM_10;
    static constexpr gpio_num_t PIN_CS = GPIO_NUM_11;
    static constexpr gpio_num_t PIN_RST = GPIO_NUM_14;

    static void send(uint8_t value, bool isData);
};
