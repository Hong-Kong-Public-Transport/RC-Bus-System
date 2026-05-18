#include "ssd1327.h"
#include <U8g2lib.h>

SSD1327::SSD1327(const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle) : DisplayDriver(128, 96, rotated, hasWipe, pixelatedStyle) {}

bool SSD1327::initRaw()
{
    return U8G2_SSD1327_VISIONOX_128X96_F_4W_SW_SPI(U8G2_R0, PIN_CLK, PIN_MOSI, PIN_CS, PIN_DC, PIN_RST).begin();
}

void SSD1327::pushRaw()
{
    // Column address
    send(0x15, false);
    send(0, false);
    send(screenWidth / 2 - 1, false);

    // Row address
    send(0x75, false);
    send(0, false);
    send(screenHeight - 1, false);

    // Write data into RAM
    for (uint16_t i = 0; i < screenWidth * screenHeight / 2; i++)
    {
        send(buffer[i], true);
    }
}

void SSD1327::send(uint8_t value, bool isData)
{
    GPIO.out_w1tc = (1 << PIN_CS) | (isData ? 0 : 1 << PIN_DC);
    GPIO.out_w1ts = (isData ? 1 << PIN_DC : 0);

    for (uint8_t i = 0; i < 8; i++)
    {
        GPIO.out_w1tc = 1 << PIN_CLK;

        if (value & 0x80)
        {
            GPIO.out_w1ts = 1 << PIN_MOSI;
        }
        else
        {
            GPIO.out_w1tc = 1 << PIN_MOSI;
        }

        asm volatile("nop\n");
        GPIO.out_w1ts = 1 << PIN_CLK;
        value <<= 1;
    }

    GPIO.out_w1ts = 1 << PIN_CS;
}
