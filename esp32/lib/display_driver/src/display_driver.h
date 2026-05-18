#pragma once

#include <Arduino.h>
#include <vector>

class DisplayDriver
{
public:
    const uint16_t screenWidth;
    const uint16_t screenHeight;

    DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle);
    bool init();
    void clear();
    void startWipe();
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness);
    void drawScaledPixel(uint16_t x, uint16_t y, float scaleX, float scaleY);
    void push();
    void setTargetFrameDuration(uint32_t targetFrameDuration);

protected:
    std::vector<uint8_t> buffer;

    virtual bool initRaw() = 0;
    virtual void pushRaw() = 0;
    void drawPixel(uint16_t x, uint16_t y, uint8_t brightness, bool replace);
    uint16_t getRotatedX(const uint16_t x);
    uint16_t getRotatedY(const uint16_t y);

private:
    static constexpr gpio_num_t PIN_SCREEN_ENABLE = GPIO_NUM_13;
    static constexpr uint32_t WIPE_FRAME_DURATION = 5000;

    const bool rotated;
    const bool hasWipe;
    const uint8_t pixelatedStyle;

    std::vector<uint8_t> wipeBuffer;
    uint32_t targetFrameDuration = 0;
    bool isWiping = false;
    unsigned long lastFrameMicros = 0;
};
