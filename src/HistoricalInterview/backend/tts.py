import sys
import asyncio
import edge_tts


async def main():
    if len(sys.argv) < 2:
        print("Usage: python tts.py <output_file>")
        sys.exit(1)

    print(f"DEBUG: Python executable: {sys.executable}", file=sys.stderr)
    print(f"DEBUG: sys.path: {sys.path}", file=sys.stderr)

    # Read text from stdin to avoid encoding issues on Windows
    text = sys.stdin.read().strip()
    if not text:
        print("Error: No text provided in stdin")
        sys.exit(1)

    output_file = sys.argv[1]

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
