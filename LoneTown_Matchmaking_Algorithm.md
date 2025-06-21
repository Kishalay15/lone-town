# Lone Town Matchmaking Algorithm Documentation

## 🌱 Philosophy: Mindful, Exclusive, Intentional

Lone Town disrupts the swipe-fatigued dating culture with a deeply intentional design:
- **One match per day** based on compatibility
- **Exclusive connection**: No parallel chats
- **Frozen reflection period** after unpinning
- **Video call unlock** after milestone achievement

---

## 👤 User Attributes Considered for Matching

Each user is profiled on the following psychological and emotional dimensions:

| Attribute               | Description                                                   |
|-------------------------|---------------------------------------------------------------|
| `emotionalIntelligence` | Numeric score representing empathy, awareness, regulation     |
| `psychologicalTraits`   | Object storing Big Five or similar trait dimensions            |
| `behavioralPatterns`    | Object tracking habits, communication style, daily rhythm     |
| `relationshipValues`    | Object reflecting preferences around commitment, depth, etc.  |

These traits are gathered during onboarding and periodically refined via interactions.

---

## ⚖️ Compatibility Scoring System

A weighted composite score is calculated using four domains:

```js
const weights = {
  emotionalIntelligence: 0.3,
  psychologicalTraits: 0.25,
  behavioralPatterns: 0.2,
  relationshipValues: 0.25,
};
```

### 🧠 Emotional Intelligence Matching

- Score = `1 - (difference / 10)` (if within ±2 range)
- Else = `0`
- Goal: Match similar empathy/regulation levels

### 🧬 Psychological & Relationship Traits

- Compared using `calculateNonLinearScore(obj1, obj2)`
- Emphasizes **alignment**, **not just similarity**

### 🔄 Behavioral Patterns

- Compared using `calculateScoreWithThresholds(obj1, obj2, threshold = 0.5)`
- Introduces nonlinearity for misalignment penalties

---

## 🧩 Match Selection Logic

The function `findBestMatch(user)` filters available users and:

- Calculates compatibility for each
- Retains best scoring match **above 0.7 threshold**
- Ensures users aren't already matched or frozen

```js
if (score > bestScore && score >= minCompatibilityThreshold) {
  bestScore = score;
  bestMatch = potentialMatch;
}
```

---

## ❤️ Match Creation Flow

If a match is made:

1. `createMatch(user1Id, user2Id)` initializes:
   - A new Match document (pinned by default)
   - Resets message count and timestamps
2. User states are updated:
   ```js
   user.state = "matched";
   user.matchStartTime = now;
   ```

---

## 🔁 User State Engine

| State     | Meaning                                          |
|-----------|--------------------------------------------------|
| `available` | Open to receive a daily match                  |
| `matched`   | Exclusively matched and chatting               |
| `pinned`    | In commitment lock; default after matching     |
| `frozen`    | Temporarily inactive post-unpin for reflection |

State transitions are automatic and managed through logic in:
- `dailyMatchmaker.js`
- `freezeManager.js`
- `unpinMatch()` and `createMatch()`

---

## 🎯 Milestone: Unlock Video Call

Tracked using `messageCount` and `matchStartTime`.

```js
if (messageCount >= 100 && within 48h) {
  match.videoUnlocked = true;
}
```

---

## 📊 Intentional Dating Design Principles

- No fast swiping: only one match per day
- No ghosting without consequence: unpin → freeze
- No parallelism: exclusivity enforced through state
- No premature escalation: video after conversation investment

---

## 🔮 Future Extensibility Suggestions

- **Decay algorithm**: Slowly reduce compatibility if traits drift over time
- **Feedback loops**: Use feedback to tune compatibility weighting
- **Active learning**: Adapt scoring based on match outcomes

---

## 📁 Files Referenced

- `matchingService.js`
- `User.js`
- `dailyMatchmaker.js`
- `matchService.js`
- `freezeManager.js`
- `milestoneTracker.js`

---

**Built with ❤️ for intentional relationships.**