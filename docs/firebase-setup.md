# Firebase Setup for Bingo Roller

1. Create a Firebase project at console.firebase.google.com.
2. Enable Realtime Database and Anonymous Authentication.
3. Copy config to src/js/roller.js (replace placeholders in firebaseConfig).
4. Set DB rules in console:
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["calledNumbers", "players"]
      }
    }
  }
}
