
# Chicago Trail Trivia 🦬

A daily Chicago trivia game wrapped in a full Oregon Trail retro pixel art experience. One question per day, AI-generated, with trail-style consequences for wrong answers.

## Core Experience

### Daily Question Screen
- Full retro pixel art UI with green/amber terminal aesthetic and pixelated fonts
- One multiple-choice Chicago trivia question per day (4 answer options)
- Questions cover Chicago history, landmarks, sports, food, neighborhoods, culture — a different topic each day
- AI generates a fresh question daily via Lovable AI backend

### Trail-Style Consequences
- **Correct answer**: Celebratory trail message ("You have successfully forded the Chicago River!" / "Your oxen are well-fed on deep dish pizza!")
- **Wrong answer**: Classic Oregon Trail disaster messages ("You have died of dysentery near Wrigley Field" / "Your wagon broke an axle on Lake Shore Drive" / "A thief stole your Italian beef")
- Fun randomized consequence messages that blend Chicago landmarks with Oregon Trail events

### Visual Design
- Pixel art / retro terminal aesthetic throughout
- Oregon Trail-inspired illustrations (wagon, trail scenes) with Chicago landmarks mixed in (Willis Tower, Bean, L train)
- Green phosphor / amber CRT monitor color palette
- Pixelated typography and UI elements
- Simple animations for correct/wrong reveals

### Daily Reset & State
- One attempt per day — once you answer, you see your result until tomorrow
- Uses local storage to track today's answer so you can't replay
- Shows a "come back tomorrow" message after answering

## Backend
- Lovable Cloud + Supabase edge function that calls Lovable AI to generate one Chicago trivia question with 4 multiple-choice options and the correct answer
- Question is generated deterministically per day (seeded by date) so all players get the same question
