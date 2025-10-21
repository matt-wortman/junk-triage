# Quick Start Guide - Agent Dialogue System

Get your two AI agents talking to each other in 5 minutes!

## Step 1: Configure the Session (2 minutes)

### Edit `status.json`:
```bash
nano agent-dialogue/status.json
```

Update these fields:
- `session_id`: Give it a descriptive name
- `created`: Current timestamp (ISO 8601 format)
- `topic`: What should the agents discuss?
- `participants.AGENT-1`: Name of your first agent
- `participants.AGENT-2`: Name of your second agent

Example:
```json
{
  "session_id": "session-code-review-payment",
  "created": "2025-10-16T14:30:00Z",
  "topic": "Review payment processing for security",
  "participants": {
    "AGENT-1": "Cline",
    "AGENT-2": "Claude"
  }
}
```

### Edit `conversation.md`:
```bash
nano agent-dialogue/conversation.md
```

Replace the "(User will provide initial context here)" section with your actual context:

```markdown
## Initial Context

**Task**: Review src/payment/process.ts for security vulnerabilities

**Focus Areas**:
- SQL injection risks
- Input validation
- Error handling

**Questions**:
1. Are there any critical security issues?
2. What should be fixed before merge?
```

## Step 2: Start the Dialogue (1 minute)

### Set the starting turn:
```bash
echo "AGENT-1" > agent-dialogue/current-turn.txt
```

## Step 3: Instruct Your Agents (2 minutes)

### In Agent 1's chat:
```
Please read and follow the protocol in agent-dialogue/PROTOCOL.md.
Check agent-dialogue/current-turn.txt to confirm it's your turn.
Read agent-dialogue/conversation.md for context.
Write your response and pass the turn to AGENT-2.
```

### In Agent 2's chat:
```
Please read and follow the protocol in agent-dialogue/PROTOCOL.md.
Wait for agent-dialogue/current-turn.txt to show "AGENT-2".
When it's your turn, read agent-dialogue/conversation.md and respond.
Pass the turn back to AGENT-1 when done.
```

## Step 4: Watch the Magic! ✨

Open `agent-dialogue/conversation.md` in your editor and watch them talk!

Or use the monitoring script:
```bash
./agent-dialogue/monitor.sh
```

Or watch live:
```bash
tail -f agent-dialogue/conversation.md
```

## Common Commands

### Check whose turn it is:
```bash
cat agent-dialogue/current-turn.txt
```

### Send a command to agents:
```bash
echo "PAUSE" >> agent-dialogue/user-commands.txt
echo "PRIORITY: Focus on security only" >> agent-dialogue/user-commands.txt
```

### Take control yourself:
```bash
echo "USER" > agent-dialogue/current-turn.txt
# Edit conversation.md to add your message
echo "AGENT-1" > agent-dialogue/current-turn.txt  # Give turn back
```

### Archive when done:
```bash
./agent-dialogue/archive-session.sh "Description of what was discussed"
```

## Troubleshooting

### Agents not responding?
```bash
# Check the turn
cat agent-dialogue/current-turn.txt

# Remove stale lock if needed
rm -f agent-dialogue/lock.txt

# Make sure files are readable
ls -la agent-dialogue/
```

### Want to reset and start over?
```bash
echo "USER" > agent-dialogue/current-turn.txt
# Edit conversation.md and status.json for new topic
```

## Tips for Success

1. **Be specific** in your initial context - tell agents exactly what to focus on
2. **Give them roles** - "AGENT-1: Security expert, AGENT-2: Performance expert"
3. **Let them talk** - Don't intervene too quickly, they'll often work it out
4. **Monitor but don't micromanage** - Watch the conversation unfold
5. **Archive sessions** - Keep a record of important discussions

## Example Session Flow

```
1. You edit status.json and conversation.md (setup)
2. You set current-turn.txt to "AGENT-1"
3. Agent 1 reads, analyzes, writes message, sets turn to "AGENT-2"
4. Agent 2 reads, responds, sets turn to "AGENT-1"
5. They go back and forth...
6. They use [NEEDS-USER] when they need your input
7. You set turn to "USER" and respond
8. You set turn back to an agent
9. They conclude with [PROPOSE-END]
10. You archive the session
```

## That's It!

For more details, see:
- **PROTOCOL.md** - Complete protocol specification
- **README.md** - Comprehensive documentation
- **EXAMPLE-SESSION.md** - Full example dialogue

---

**Pro tip**: Open three windows side-by-side:
1. `conversation.md` (to watch the dialogue)
2. Agent 1's chat
3. Agent 2's chat

Then just sit back and watch them collaborate! 🤖💬🤖
