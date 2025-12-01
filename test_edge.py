import asyncio
import edge_tts

async def main():
    print("Starting TTS test...")
    communicate = edge_tts.Communicate("Hello", "en-US-AriaNeural")
    await communicate.save("test_output.mp3")
    print("TTS test complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error: {e}")
