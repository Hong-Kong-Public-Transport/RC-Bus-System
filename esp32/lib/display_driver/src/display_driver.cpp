#include "display_driver.h"

DisplayDriver::DisplayDriver(const uint16_t screenWidth, const uint16_t screenHeight, const bool rotated, const bool hasWipe, const uint8_t pixelatedStyle) : screenWidth(screenWidth), screenHeight(screenHeight), rotated(rotated), hasWipe(hasWipe), pixelatedStyle(pixelatedStyle)
{
    buffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
    wipeBuffer = std::vector<uint8_t>(screenWidth * screenHeight / 2);
}

bool DisplayDriver::init()
{
    pinMode(PIN_SCREEN_ENABLE, OUTPUT);
    digitalWrite(PIN_SCREEN_ENABLE, HIGH);
    delay(100);
    return initRaw();
}

void DisplayDriver::clear()
{
    std::vector<uint8_t> &currentBuffer = isWiping ? wipeBuffer : buffer;
    std::fill(currentBuffer.begin(), currentBuffer.end(), 0);
}

void DisplayDriver::startWipe()
{
    isWiping = hasWipe;
    clear();
}

void DisplayDriver::drawPixel(uint16_t x, uint16_t y, uint8_t brightness)
{
    drawPixel(x, y, brightness, true);
}

void DisplayDriver::drawScaledPixel(uint16_t x, uint16_t y, float scaleX, float scaleY)
{
    float x1a = x * scaleX;
    float x2a = (x + 1) * scaleX;
    uint16_t x1b = floor(x1a);
    uint16_t x2b = ceil(x2a);
    float centerX = pixelatedStyle == 1 ? (x1a + x2a) / 2 : (pixelatedStyle == 2 ? x2a : 0);
    float y1a = y * scaleY;
    float y2a = (y + 1) * scaleY;
    uint16_t y1b = floor(y1a);
    uint16_t y2b = ceil(y2a);
    float centerY = pixelatedStyle == 1 ? (y1a + y2a) / 2 : (pixelatedStyle == 2 ? y2a : 0);

    for (uint16_t newX = x1b; newX < x2b; newX++)
    {
        for (uint16_t newY = y1b; newY < y2b; newY++)
        {
            float brightnessX = newX == x1b ? x1b + 1 - x1a : (newX == x2b - 1 ? x2b - newX : 1);
            float brightnessY = newY == y1b ? y1b + 1 - y1a : (newY == y2b - 1 ? y2b - newY : 1);
            float modifierX = pixelatedStyle == 1 || pixelatedStyle == 2 ? max(0.0F, min(1.0F, 1 - abs(centerX - newX - 0.5F) * (pixelatedStyle == 1 ? 2 : 1) / scaleX)) : 1;
            float modifierY = pixelatedStyle == 1 || pixelatedStyle == 2 ? max(0.0F, min(1.0F, 1 - abs(centerY - newY - 0.5F) * (pixelatedStyle == 1 ? 2 : 1) / scaleY)) : 1;
            drawPixel(newX, newY, brightnessX * brightnessY * modifierX * modifierY * 0x0F, false);
        }
    }
}

void DisplayDriver::push()
{
    for (uint16_t x = 0; x < screenWidth; x++)
    {
        if (isWiping)
        {
            uint16_t rotatedX = getRotatedX(x);
            uint16_t index1 = rotatedX / 2;
            uint16_t index2 = screenWidth / 2;
            bool isEven = rotatedX % 2 == 0;

            for (uint16_t y = 0; y < screenHeight; y++)
            {
                uint16_t index = index1 + y * index2;

                if (isEven)
                {
                    buffer[index] = (wipeBuffer[index] & 0xF0) | (buffer[index] & 0x0F);
                }
                else
                {
                    buffer[index] = (buffer[index] & 0xF0) | (wipeBuffer[index] & 0x0F);
                }
            }
        }

        while (micros() - lastFrameMicros < (isWiping ? WIPE_FRAME_DURATION : targetFrameDuration))
        {
            delayMicroseconds(1);
        }

        lastFrameMicros = micros();
        pushRaw();

        if (!isWiping)
        {
            return;
        }
    }

    isWiping = false;
}

void DisplayDriver::setTargetFrameDuration(uint32_t targetFrameDuration)
{
    this->targetFrameDuration = targetFrameDuration;
}

void DisplayDriver::drawPixel(uint16_t x, uint16_t y, uint8_t brightness, bool replace)
{
    if (x >= screenWidth || y >= screenHeight)
    {
        return;
    }

    uint16_t rotatedX = getRotatedX(x);
    uint16_t rotatedY = getRotatedY(y);
    uint16_t index = rotatedX / 2 + rotatedY * screenWidth / 2;
    std::vector<uint8_t> &currentBuffer = isWiping ? wipeBuffer : buffer;

    if (rotatedX % 2 == 0)
    {
        currentBuffer[index] = ((brightness & 0x0F) << 4) | (currentBuffer[index] & (replace ? 0x0F : 0xFF));
    }
    else
    {
        currentBuffer[index] = (currentBuffer[index] & (replace ? 0xF0 : 0xFF)) | (brightness & 0x0F);
    }
}

uint16_t DisplayDriver::getRotatedX(const uint16_t x)
{
    return rotated ? screenWidth - x - 1 : x;
}

uint16_t DisplayDriver::getRotatedY(const uint16_t y)
{
    return rotated ? screenHeight - y - 1 : y;
}
