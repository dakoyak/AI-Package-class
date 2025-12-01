import sys
import asyncio
import edge_tts


async def main():
    if len(sys.argv) < 3:
        print("Usage: python tts.py <text> <output_file>")
        sys.exit(1)

    text = sys.argv[1]
    output_file = sys.argv[2]

    # Voice: ko-KR-InJoonNeural (Male - Deep and authoritative)
    # Pitch: -13Hz (Deeper voice for royal authority)
    # Rate: -8% (Slightly slower, dignified but not too slow)
    # Volume: +3% (Subtle presence boost)
    communicate = edge_tts.Communicate(
        text, "ko-KR-BongJinNeural", pitch="-12Hz", rate="+15%", volume="+5%"
    )

    await communicate.save(output_file)
    print(f"Audio saved to {output_file}")


if __name__ == "__main__":
    asyncio.run(main())
