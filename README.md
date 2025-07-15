# BaitMate

A React Native mobile app that helps beginner anglers choose fishing gear based on their target species and fishing method.

## Features

- **Welcome Screen**: Simple welcome message with "Get Started" button
- **Species Selector**: Choose from popular fish species (Salmon, Bass, Catfish, Trout, Bluegill, Walleye)
- **Gear Ownership**: Determine if user already has fishing gear
- **Method Questions**: Multi-step questionnaire about fishing preferences:
  - Fishing location (shore, wading, boat)
  - Bait preference (live bait, lures, both)
  - Experience level (beginner, intermediate, advanced)

## Tech Stack

- React Native with Expo
- React Navigation for screen routing
- Expo Vector Icons for UI icons
- StyleSheet API for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BaitMate
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Install the Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator or 'a' for Android emulator

## Project Structure

```
BaitMate/
├── App.js                 # Main app component with navigation
├── src/
│   └── screens/
│       ├── WelcomeScreen.js           # Welcome screen
│       ├── SpeciesSelectorScreen.js   # Fish species selection
│       ├── GearOwnershipScreen.js     # Gear ownership question
│       └── MethodQuestionScreen.js    # Multi-step questionnaire
├── package.json
├── app.json
└── babel.config.js
```

## Screen Flow

1. **Welcome Screen** → "Get Started" button
2. **Species Selector** → Choose fish species → "Continue" button
3. **Gear Ownership** → "Yes/No" selection → "Continue" button
4. **Method Questions** → Answer 3 questions → "Get Recommendations" button

## Data Flow

The app uses React Navigation's route parameters to pass user selections between screens:

- `selectedSpecies`: Object with fish species data
- `hasGear`: Boolean indicating if user owns gear
- `answers`: Object containing responses to method questions

## Future Enhancements

- Connect to backend API for gear recommendations
- Add user authentication
- Implement gear recommendation algorithm
- Add gear comparison features
- Include fishing location mapping
- Add user profile and history

## Development Notes

- All styling uses StyleSheet API for optimal performance
- Icons are from Expo Vector Icons (Ionicons)
- Navigation uses React Navigation v6
- State management is local component state (can be upgraded to Redux/Context later)
- Mock data is used for species and questions (ready for API integration) 