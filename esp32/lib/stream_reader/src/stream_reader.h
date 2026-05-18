#pragma once

#include "stream_wrapper.h"
#include "display_driver.h"

class StreamReader
{
public:
    void init(StreamWrapper *streamWrapper);
    bool draw(DisplayDriver *displayDriver, const uint32_t imageIndex);
    uint32_t getImageCount() const { return imageCount; }

private:
    static constexpr uint32_t DEFAULT_FRAME_DURATION = 30 * 1000;       // 30 ms
    static constexpr uint32_t DEFAULT_IMAGE_DURATION = 2 * 1000 * 1000; // 2 seconds

    StreamWrapper *streamWrapper;
    uint32_t imageCount = 0;
    uint32_t headerSize = 0;

    uint32_t lastImageIndex = 0;
    uint32_t frameIndex = 0;

    struct Scale
    {
        const float x;
        const float y;
    };

    struct Dimensions
    {
        const uint32_t x;
        const uint32_t y;
    };

    struct Offset
    {
        const int32_t x;
        const int32_t y;
    };

    Scale getScale(Dimensions dimensions);
    void updateFrameIndex(DisplayDriver *displayDriver, bool newImage, uint32_t frameCount);
    void decodePackBits(DisplayDriver *displayDriver, Dimensions dimensions, Scale scale, Offset imageOffset, uint32_t sameColumnCount, uint32_t animatedColumnCount);
    void drawByte(DisplayDriver *displayDriver, Dimensions dimensions, Scale scale, Offset imageOffset, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount);
};
