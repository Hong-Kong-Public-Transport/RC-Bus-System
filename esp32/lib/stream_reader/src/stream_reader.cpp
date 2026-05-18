#include "stream_reader.h"

void StreamReader::init(StreamWrapper *streamWrapper)
{
    this->streamWrapper = streamWrapper;
    imageCount = streamWrapper->readInt();
    headerSize = sizeof(imageCount);
}

bool StreamReader::draw(DisplayDriver *displayDriver, const uint32_t imageIndex)
{
    bool newImage = imageIndex != lastImageIndex;
    lastImageIndex = imageIndex;

    if (newImage)
    {
        displayDriver->startWipe();
    }
    else
    {
        displayDriver->clear();
    }

    streamWrapper->seek(headerSize + imageIndex * sizeof(uint32_t));
    uint32_t offset = streamWrapper->readInt();
    streamWrapper->seek(offset);

    Dimensions dimensions = {streamWrapper->readInt(), streamWrapper->readInt()};
    Scale scale = getScale(dimensions);
    Offset imageOffset = {
        static_cast<int32_t>(floor((displayDriver->screenWidth - dimensions.x * scale.x) / 2 / scale.x)),
        static_cast<int32_t>(floor((displayDriver->screenHeight - dimensions.y * scale.y) / 2 / scale.y)),
    };

    uint8_t displayType = streamWrapper->readByte();
    uint32_t frameCount;
    uint32_t frameDuration;

    switch (displayType)
    {
    case 1: // Generic animated
    {
        frameCount = streamWrapper->readInt();
        updateFrameIndex(displayDriver, newImage, frameCount);

        streamWrapper->seek(offset + sizeof(displayType) + sizeof(frameCount) + frameIndex * sizeof(offset));
        offset = streamWrapper->readInt();
        streamWrapper->seek(offset);

        frameDuration = streamWrapper->readInt();
        decodePackBits(displayDriver, dimensions, scale, imageOffset, dimensions.x, 0);
        break;
    }
    case 2: // Standard scroll
    {
        uint32_t sameColumnCount = streamWrapper->readInt();
        uint32_t animatedColumnCount = streamWrapper->readInt();
        frameCount = animatedColumnCount + dimensions.x - sameColumnCount + 1;
        updateFrameIndex(displayDriver, newImage, frameCount);

        frameDuration = DEFAULT_FRAME_DURATION;
        decodePackBits(displayDriver, dimensions, scale, imageOffset, sameColumnCount, animatedColumnCount);
        break;
    }
    default: // Generic image
    {
        frameCount = DEFAULT_IMAGE_DURATION / DEFAULT_FRAME_DURATION;
        updateFrameIndex(displayDriver, newImage, frameCount);

        frameDuration = DEFAULT_FRAME_DURATION;
        decodePackBits(displayDriver, dimensions, scale, imageOffset, dimensions.x, 0);
        break;
    }
    }

    frameIndex++;
    displayDriver->push();
    displayDriver->setTargetFrameDuration(frameDuration);
    return frameIndex == frameCount;
}

StreamReader::Scale StreamReader::getScale(Dimensions dimensions)
{
    if (dimensions.x == 128 && dimensions.y == 32)
    {
        return {1.5F, 1.5F};
    }
    else if (dimensions.x == 160 && dimensions.y == 24)
    {
        return {1.6F, 1.6F};
    }
    else if (dimensions.x == 28 && dimensions.y == 14)
    {
        return {4.5F, 4.5F};
    }
    else if (dimensions.x == 36 && dimensions.y == 17)
    {
        float ratio = 17.0F / 14.0F;
        return {3.5F, 3.5F * ratio};
    }
    else
    {
        return {1.0F, 1.0F};
    }
}

void StreamReader::updateFrameIndex(DisplayDriver *displayDriver, bool newImage, uint32_t frameCount)
{
    if (newImage || frameIndex >= frameCount)
    {
        frameIndex = 0;
    }
}

void StreamReader::decodePackBits(DisplayDriver *displayDriver, Dimensions dimensions, Scale scale, Offset imageOffset, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint16_t decodedIndex = 0;
    while (decodedIndex < (sameColumnCount + animatedColumnCount) * dimensions.y / 8)
    {
        int8_t header = streamWrapper->readByte();
        if (header >= 0)
        {
            // Literal run
            for (int i = 0; i < header + 1; i++)
            {
                drawByte(displayDriver, dimensions, scale, imageOffset, decodedIndex++, streamWrapper->readByte(), sameColumnCount, animatedColumnCount);
            }
        }
        else if (header > -128)
        {
            // Repeated bytes
            uint8_t value = streamWrapper->readByte();
            for (int i = 0; i < 1 - header; i++)
            {
                drawByte(displayDriver, dimensions, scale, imageOffset, decodedIndex++, value, sameColumnCount, animatedColumnCount);
            }
        }
    }
}

void StreamReader::drawByte(DisplayDriver *displayDriver, Dimensions dimensions, Scale scale, Offset imageOffset, uint16_t decodedIndex, uint8_t byte, uint32_t sameColumnCount, uint32_t animatedColumnCount)
{
    uint32_t base = decodedIndex * 8;
    uint32_t rawWidth = sameColumnCount + animatedColumnCount;

    for (uint8_t i = 0; i < 8; i++)
    {
        uint32_t x = (base + i) % rawWidth;
        uint32_t y = (base + i) / rawWidth;

        if (x >= sameColumnCount)
        {
            x += dimensions.x - sameColumnCount - frameIndex;
            if (x < sameColumnCount || x >= dimensions.x)
            {
                continue;
            }
        }

        if ((byte >> i) & 1)
        {
            int32_t drawX = imageOffset.x + static_cast<int32_t>(x);
            int32_t drawY = imageOffset.y + static_cast<int32_t>(y);

            if (drawX < 0 || drawY < 0)
            {
                continue;
            }

            displayDriver->drawScaledPixel(static_cast<uint16_t>(drawX), static_cast<uint16_t>(drawY), scale.x, scale.y);
        }
    }
}
