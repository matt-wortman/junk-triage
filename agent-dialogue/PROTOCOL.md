# Agent Communication Protocol

## Overview
This protocol enables two AI coding agents to communicate asynchronously through shared files. The system uses a turn-based approach to prevent conflicts and maintain conversation coherence.

## Participants
- **AGENT-1**: First agent (e.g., Cline, Claude, Cursor)
- **AGENT-2**: Second agent (e.g., Claude, Windsurf, GitHub Copilot)
- **USER**: Human observer who can intervene

## Core Files

### 1. `conversation.md`
The main dialogue log where all messages are appended sequentially.

### 2. `current-turn.txt`
Contains only one line indicating whose turn it is: `AGENT-1`, `AGENT-2`, or `USER`.

### 3. `status.json`
Metadata about the current session (message count, timestamps, topic, etc.).

### 4. `lock.txt` (optional)
Prevents simultaneous file writes. Contains agent ID during write operations.

### 5. `user-commands.txt`
Allows the user to send commands to agents (PAUSE, RESET, etc.).

## Communication Protocol

### Step 1: Check Your Turn
```
1. Read current-turn.txt
2. If the content is YOUR agent ID, proceed to Step 2
3. If not, wait and check again (do not proceed)
4. If content is "USER", wait for user intervention
```

### Step 2: Acquire Lock (Optional but Recommended)
```
1. Check if lock.txt exists
2. If it exists, wait 2 seconds and retry
3. If it doesn't exist, create lock.txt with your agent ID
4. Proceed to Step 3
```

### Step 3: Read Context
```
1. Read conversation.md in full
2. Read status.json for session metadata
3. Read user-commands.txt for any user instructions
4. Understand the current topic and conversation flow
```

### Step 4: Compose Your Response
Format your message as follows:

```markdown
## Message #N [YOUR-AGENT-ID] - YYYY-MM-DD HH:MM:SS

[Your full response here]

### Key Points
- Point 1
- Point 2

### Questions for [OTHER-AGENT-ID]
1. Question 1
2. Question 2

### Recommendations
- Recommendation 1
- Recommendation 2

---
```

### Step 5: Write Your Response
```
1. Append your formatted message to conversation.md
2. Do NOT modify existing messages
3. Do NOT delete content from conversation.md
4. Only APPEND to the end of the file
```

### Step 6: Update Metadata
```
1. Read status.json
2. Increment message_count by 1
3. Update last_update with current timestamp
4. Update last_speaker with your agent ID
5. Write updated status.json
```

### Step 7: Pass the Turn
```
1. Write the OTHER agent's ID to current-turn.txt
   - If you are AGENT-1, write "AGENT-2"
   - If you are AGENT-2, write "AGENT-1"
2. Remove lock.txt (if using lock mechanism)
```

### Step 8: Confirm Completion
Tell the user: "I've written my response to the agent dialogue. The turn is now with [OTHER-AGENT]."

## Special Commands

### From Your Message
Include these special markers in your message when needed:

- **`[NEEDS-USER]`**: Request user intervention or decision
- **`[WAITING]`**: Indicate you're waiting for the other agent to provide information
- **`[PROPOSE-END]`**: Suggest ending the dialogue session
- **`[QUESTION-CRITICAL]`**: Indicate a critical question that must be answered
- **`[AGREEMENT]`**: Explicitly agree with previous points
- **`[DISAGREEMENT]`**: Explicitly disagree (provide reasoning)

### From user-commands.txt
Check this file before writing. User commands include:

- **`PAUSE`**: Stop participating until RESUME command
- **`RESUME`**: Continue after PAUSE
- **`RESET`**: Start a new conversation (archive current)
- **`SWITCH-TOPIC: [new topic]`**: Change discussion focus
- **`END-SESSION`**: Conclude the dialogue
- **`PRIORITY: [message]`**: User's urgent input
- **`AGENT-1-ONLY`**: Only AGENT-1 should respond next
- **`AGENT-2-ONLY`**: Only AGENT-2 should respond next

## Message Formatting Guidelines

### DO:
- ✅ Use clear section headers
- ✅ Include timestamps
- ✅ Format code with proper markdown code blocks
- ✅ Use bullet points for lists
- ✅ Ask specific questions
- ✅ Reference previous message numbers (e.g., "In Message #3, you mentioned...")
- ✅ Acknowledge the other agent's points
- ✅ Be concise but thorough

### DON'T:
- ❌ Modify previous messages
- ❌ Delete content from conversation.md
- ❌ Write when it's not your turn
- ❌ Skip reading the full conversation
- ❌ Ignore user commands
- ❌ Write multiple messages in one turn
- ❌ Leave lock.txt in place after writing

## Error Handling

### If conversation.md is corrupted:
1. Write "[ERROR] conversation.md appears corrupted" to current-turn.txt
2. Wait for user to fix

### If lock.txt is stuck (exists for >60 seconds):
1. Check timestamp on lock.txt
2. If older than 60 seconds, assume stale and remove it
3. Proceed with your turn

### If status.json is invalid:
1. Attempt to read the file
2. If it fails, notify user: "status.json needs repair"
3. Continue with conversation.md only

### If unsure of turn:
1. Default to waiting
2. Never write when uncertain
3. Ask user for clarification

## Best Practices

### 1. **Be Responsive**
- Address the other agent's questions directly
- Acknowledge their suggestions
- Build on their ideas or explain disagreements

### 2. **Stay on Topic**
- Check status.json for current topic
- If changing topics, explain why
- Use `[PROPOSE-TOPIC-CHANGE: new topic]` marker

### 3. **Provide Value**
- Don't just agree without adding insight
- Share different perspectives
- Offer concrete suggestions or code examples

### 4. **Request Clarification**
- If the other agent is unclear, ask specific questions
- Don't make assumptions about intent
- Summarize your understanding and ask for confirmation

### 5. **Know When to End**
- If consensus is reached, use `[PROPOSE-END]`
- If stuck in loop, request user intervention with `[NEEDS-USER]`
- Summarize conclusions before ending

## Example Turn Cycle

```
Initial State:
- current-turn.txt contains "AGENT-1"
- conversation.md has messages #1-5
- status.json shows message_count: 5

AGENT-1's Turn:
1. Reads current-turn.txt → sees "AGENT-1" → it's my turn!
2. Creates lock.txt with "AGENT-1"
3. Reads conversation.md messages #1-5
4. Composes message #6
5. Appends message #6 to conversation.md
6. Updates status.json (message_count: 6, last_speaker: "AGENT-1")
7. Writes "AGENT-2" to current-turn.txt
8. Removes lock.txt
9. Tells user: "Response written, AGENT-2's turn"

AGENT-2's Turn:
1. Reads current-turn.txt → sees "AGENT-2" → it's my turn!
2. Creates lock.txt with "AGENT-2"
3. Reads conversation.md messages #1-6
4. Composes message #7
5. Appends message #7 to conversation.md
6. Updates status.json (message_count: 7, last_speaker: "AGENT-2")
7. Writes "AGENT-1" to current-turn.txt
8. Removes lock.txt
9. Tells user: "Response written, AGENT-1's turn"
```

## Session Lifecycle

### Starting a Session
1. User creates initial conversation.md with topic and context
2. User sets status.json with session details
3. User writes "AGENT-1" to current-turn.txt
4. User notifies AGENT-1 to begin

### During a Session
- Agents alternate turns
- User can observe in real-time
- User can inject commands via user-commands.txt
- Conversation grows in conversation.md

### Ending a Session
1. Agent writes `[PROPOSE-END]` or user writes "END-SESSION" command
2. Both agents acknowledge
3. User archives conversation to archive/ directory
4. User can start new session with fresh files

## Monitoring for Users

### Real-Time Monitoring
- Open conversation.md in your editor (auto-refresh enabled)
- Watch current-turn.txt to see whose turn it is
- Check status.json periodically for metadata

### Intervention
- Edit user-commands.txt to send commands
- Change current-turn.txt to "USER" to take control
- Add messages directly to conversation.md if needed

### Archiving
```bash
# Archive completed session
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p agent-dialogue/archive/session-$DATE
mv agent-dialogue/conversation.md agent-dialogue/archive/session-$DATE/
mv agent-dialogue/status.json agent-dialogue/archive/session-$DATE/
```

## Integration with Development Workflow

This dialogue system works alongside your normal development:
- Use it for design discussions
- Use it for code reviews between agents
- Use it for debugging conversations
- Use it for architectural decisions
- Use it for test planning

The agents can reference actual code files in the project and make specific recommendations that you can then implement.

## Troubleshooting

**Agents not responding?**
- Check current-turn.txt - is it set correctly?
- Check for stale lock.txt
- Ensure agents have read the protocol

**Conversation getting too long?**
- Archive and start fresh
- Provide summary in new session
- Reference archived session number

**Agents talking past each other?**
- Inject USER command: "PRIORITY: Focus on [specific issue]"
- Reset turn to USER
- Add clarifying context to conversation.md

**File conflicts?**
- Use lock.txt mechanism strictly
- Ensure only one agent writes at a time
- Check file permissions

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-16  
**Maintained By**: User with assistance from AI agents
