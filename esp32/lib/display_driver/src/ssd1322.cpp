#include "ssd1322.h"
#include <U8g2lib.h>

SSD1322::SSD1322(const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle) : DisplayDriver(256, 64, rotated, hasWipe, pixelatedStyle) {}

bool SSD1322::initRaw()
{
    return U8G2_SSD1322_NHD_256X64_F_8080(U8G2_R0, PIN_D0, PIN_D1, PIN_D2, PIN_D3, PIN_D4, PIN_D5, PIN_D6, PIN_D7, PIN_WR, PIN_CS, PIN_DC, PIN_RST).begin();
}

void SSD1322::pushRaw()
{
    // Column address
    send(0x15, false);
    send(28, true);
    send(28 + screenWidth / 4 - 1, true);

    // Row address
    send(0x75, false);
    send(0, true);
    send(screenHeight - 1, true);

    // Write data into RAM
    send(0x5C, false);

    for (uint16_t i = 0; i < screenWidth * screenHeight / 2; i++)
    {
        send(buffer[i], true);
    }
}

void SSD1322::send(uint8_t value, bool isData)
{
    GPIO.out_w1tc = (1 << PIN_D0) |
                    (1 << PIN_D1) |
                    (1 << PIN_D2) |
                    (1 << PIN_D3) |
                    (1 << PIN_D4) |
                    (1 << PIN_D5) |
                    (1 << PIN_D6) |
                    (1 << PIN_D7) |
                    (1 << PIN_CS) |
                    (isData ? 0 : 1 << PIN_DC);
    GPIO.out_w1ts = (value & 0x01 ? 1 << PIN_D0 : 0) |
                    (value & 0x02 ? 1 << PIN_D1 : 0) |
                    (value & 0x04 ? 1 << PIN_D2 : 0) |
                    (value & 0x08 ? 1 << PIN_D3 : 0) |
                    (value & 0x10 ? 1 << PIN_D4 : 0) |
                    (value & 0x20 ? 1 << PIN_D5 : 0) |
                    (value & 0x40 ? 1 << PIN_D6 : 0) |
                    (value & 0x80 ? 1 << PIN_D7 : 0) |
                    (isData ? 1 << PIN_DC : 0);
    GPIO.out_w1tc = (1 << PIN_WR);
    asm volatile("nop\n");
    GPIO.out_w1ts = (1 << PIN_WR) | (1 << PIN_CS);
}
