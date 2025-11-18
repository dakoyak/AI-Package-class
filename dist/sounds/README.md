# Sound Effects

This directory contains sound effects for the AI Detective HQ application.

## Required Sound Files

### click.mp3
- **Purpose**: Button click sound effect
- **Usage**: Plays when users click on buttons and interactive elements
- **Recommended**: Short, pleasant click or pop sound (100-300ms)
- **Format**: MP3
- **Size**: Keep under 50KB for fast loading

### result.mp3
- **Purpose**: Result display sound effect
- **Usage**: Plays when AI results are displayed
- **Recommended**: Pleasant notification or success sound (300-500ms)
- **Format**: MP3
- **Size**: Keep under 100KB for fast loading

### error.mp3
- **Purpose**: Error notification sound effect
- **Usage**: Plays when an error occurs
- **Recommended**: Gentle error or alert sound (200-400ms)
- **Format**: MP3
- **Size**: Keep under 50KB for fast loading

## Fallback Behavior

The application includes a **Web Audio API fallback** that generates sounds programmatically if the MP3 files are not found. This means:

1. If sound files are missing, the app will still play sounds using synthesized audio
2. The fallback sounds are simple but functional
3. For the best user experience, add actual sound files

## Adding Sound Files

1. Place your sound files (`click.mp3`, `result.mp3`, `error.mp3`) in this directory
2. The application will automatically use them for interactions
3. If files are missing, Web Audio API fallback will be used automatically

## Sound Resources

You can find free sound effects at:
- https://freesound.org/
- https://mixkit.co/free-sound-effects/
- https://www.zapsplat.com/
- https://pixabay.com/sound-effects/

## Recommended Sounds

### For click.mp3:
- Search for: "button click", "UI click", "pop"
- Example: Light switch click, soft pop sound

### For result.mp3:
- Search for: "notification", "success", "achievement"
- Example: Pleasant chime, success bell

### For error.mp3:
- Search for: "error", "alert", "warning"
- Example: Gentle error beep, soft alert tone

## Note

Sound effects enhance the user experience, especially for classroom presentations. The Web Audio API fallback ensures the application works even without sound files, but adding actual sound files provides a more polished experience.
