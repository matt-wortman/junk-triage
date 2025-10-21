# Agent Dialogue System - User Guide

## Overview

This system enables two AI coding agents to communicate asynchronously through shared files, eliminating the need for manual copy-pasting between agent chats. You can observe their conversation in real-time while they negotiate, review code, and make decisions together.

## Quick Start

### 1. Set Up a New Session

Edit `status.json` to configure your session:

```json
{
  "session_id": "session-20251016-code-review",
  "created": "2025-10-16T10:15:00Z",
  "current_turn": "AGENT-1",
  "message_count": 0,
  "last_update": null,
  "last_speaker": null,
  "topic": "Review payment processing security",
  "status": "active",
  "participants": {
    "AGENT-1": "Cline",
    "AGENT-2": "Claude"
  },
  "session_notes": "Security review of payment module"
}
```

### 2. Add Initial Context

Edit `conversation.md` and replace the placeholder text in the "Initial Context" section with your topic:

```markdown
## Initial Context

We need to review the payment processing module for security vulnerabilities.
Focus areas:
- SQL injection risks
- Authentication/authorization
- Input validation
- Error handling

Files to review:
- src/payment/process.ts
- src/payment/validate.ts
```

### 3. Set the Starting Turn

Write the first agent's ID to `current-turn.txt`:

```bash
echo "AGENT-1" > agent-dialogue/current-turn.txt
```

### 4. Instruct the First Agent

In **Agent 1's chat**, provide these instructions:

```
Please read and follow the protocol in agent-dialogue/PROTOCOL.md.
Check agent-dialogue/current-turn.txt to confirm it's your turn.
Read agent-dialogue/conversation.md for context.
Write your response to the conversation and pass the turn to AGENT-2.
```

### 5. Instruct the Second Agent

In **Agent 2's chat**, provide these instructions:

```
Please read and follow the protocol in agent-dialogue/PROTOCOL.md.
Wait for agent-dialogue/current-turn.txt to show "AGENT-2".
When it's your turn, read agent-dialogue/conversation.md and respond.
Pass the turn back to AGENT-1 when done.
```

### 6. Monitor the Conversation

Open `agent-dialogue/conversation.md` in your editor and watch the dialogue unfold!

## Directory Structure

```
agent-dialogue/
├── PROTOCOL.md           # Complete protocol for agents
├── README.md            # This file
├── conversation.md      # Main dialogue log
├── current-turn.txt     # Turn indicator (AGENT-1, AGENT-2, or USER)
├── status.json          # Session metadata
├── user-commands.txt    # Commands from user to agents
├── lock.txt            # (Created/deleted by agents during writes)
└── archive/            # Archived sessions
    └── session-YYYYMMDD-HHMMSS/
        ├── conversation.md
        └── status.json
```

## Core Files Explained

### conversation.md
The main dialogue file where all messages are appended. Both agents and you can read this file at any time. Agents append their messages following the format specified in PROTOCOL.md.

### current-turn.txt
A simple one-line file containing either:
- `AGENT-1` - Agent 1 should write next
- `AGENT-2` - Agent 2 should write next
- `USER` - User intervention needed

### status.json
Metadata about the current session:
- Session ID and topic
- Message count
- Last update timestamp
- Participant names

### user-commands.txt
Your control interface. Add commands here and agents will read them before each turn:
- `PAUSE` - Stop the dialogue
- `RESUME` - Continue after pause
- `PRIORITY: [message]` - Urgent instruction
- `END-SESSION` - Conclude the dialogue

### lock.txt
Temporarily created by agents during file writes to prevent conflicts. If you see this file stuck for >60 seconds, you can safely delete it.

## Common Workflows

### Workflow 1: Code Review

```markdown
Topic: Review new authentication module
Agent 1: Security-focused agent
Agent 2: Code quality-focused agent

1. Set topic in status.json
2. Add files to review in conversation.md context
3. Start with AGENT-1 (security review)
4. AGENT-2 responds with code quality feedback
5. They negotiate and reach consensus
6. User reviews their recommendations
```

### Workflow 2: Architecture Decision

```markdown
Topic: Choose database schema for feature X
Agent 1: Backend specialist
Agent 2: Performance specialist

1. Describe requirements in conversation.md
2. Agent 1 proposes schema design
3. Agent 2 evaluates performance implications
4. They iterate on the design
5. User makes final decision based on their discussion
```

### Workflow 3: Bug Investigation

```markdown
Topic: Debug intermittent API timeout
Agent 1: Diagnostic agent
Agent 2: Solution architect

1. Provide error logs in conversation.md
2. Agent 1 analyzes logs and hypothesizes causes
3. Agent 2 evaluates hypotheses and suggests tests
4. Agent 1 confirms with additional data
5. Agent 2 proposes solution
6. User implements the solution
```

## Monitoring Options

### Option 1: Manual Monitoring

Keep `agent-dialogue/conversation.md` open in your editor with auto-refresh enabled (most editors do this automatically).

### Option 2: Watch Script

Use the included monitoring script:

```bash
./agent-dialogue/monitor.sh
```

This will show you:
- Current turn
- Last update time
- Message count
- Last 10 lines of conversation

### Option 3: Live Tail

Use `tail` to watch the conversation in real-time:

```bash
tail -f agent-dialogue/conversation.md
```

### Option 4: Git Diff

The agents modify files, so you can use git to see what changed:

```bash
git diff agent-dialogue/conversation.md
```

## User Intervention

### Taking Control

If you need to intervene:

```bash
# Take control
echo "USER" > agent-dialogue/current-turn.txt

# Add your message directly to conversation.md
# Then set turn back to an agent
echo "AGENT-1" > agent-dialogue/current-turn.txt
```

### Sending Commands

Edit `user-commands.txt` to add a command:

```bash
# Example: Pause the conversation
echo "PAUSE" >> agent-dialogue/user-commands.txt

# Example: Give priority instruction
echo "PRIORITY: Focus on the security aspect first" >> agent-dialogue/user-commands.txt
```

Agents read this file before each turn and will follow your commands.

### Redirecting the Conversation

```bash
# Change topic
echo "SWITCH-TOPIC: Now discuss testing strategy" >> agent-dialogue/user-commands.txt

# Force specific agent to respond
echo "AGENT-1-ONLY" >> agent-dialogue/user-commands.txt
```

## Archiving Sessions

When a dialogue session is complete:

```bash
# Archive with timestamp
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p agent-dialogue/archive/session-$DATE
cp agent-dialogue/conversation.md agent-dialogue/archive/session-$DATE/
cp agent-dialogue/status.json agent-dialogue/archive/session-$DATE/

# Reset for new session
echo "USER" > agent-dialogue/current-turn.txt
# Edit conversation.md and status.json to set up new topic
```

Or use the included archive script:

```bash
./agent-dialogue/archive-session.sh "Session description"
```

## Troubleshooting

### Problem: Agents Not Responding

**Possible causes:**
1. Wrong agent ID in `current-turn.txt`
2. Agent hasn't been instructed to check the dialogue
3. Stale `lock.txt` file

**Solutions:**
```bash
# Check current turn
cat agent-dialogue/current-turn.txt

# Remove stale lock
rm -f agent-dialogue/lock.txt

# Verify files are readable
ls -la agent-dialogue/
```

### Problem: Agents Talking Past Each Other

**Solutions:**
1. Add a `PRIORITY` command with clarification
2. Take control with `USER` turn
3. Add clarifying context directly to `conversation.md`
4. Use `SWITCH-TOPIC` to refocus

### Problem: File Conflicts

**This shouldn't happen if agents follow protocol, but if it does:**

```bash
# Check for lock file
ls -la agent-dialogue/lock.txt

# If lock is old (>60 seconds), remove it
rm agent-dialogue/lock.txt

# Verify only one agent has the turn
cat agent-dialogue/current-turn.txt
```

### Problem: Conversation Too Long

```bash
# Archive and start fresh
./agent-dialogue/archive-session.sh "Long session on X"

# Reference the archived session in new conversation.md:
# "Continuing from session-20251016-101530, where we decided..."
```

## Tips for Effective Dialogues

### 1. **Set Clear Topics**
Don't just say "review the code" - be specific:
- "Review payment.ts for SQL injection vulnerabilities"
- "Discuss pros/cons of REST vs GraphQL for this API"
- "Debug why user authentication fails on mobile"

### 2. **Provide Context**
In the initial context section, include:
- Relevant file paths
- Error messages or logs
- Requirements or constraints
- Questions that need answering

### 3. **Assign Roles**
Give each agent a specific perspective:
- Agent 1: Security expert
- Agent 2: Performance expert
- Agent 1: Frontend specialist  
- Agent 2: Backend specialist

### 4. **Intervene Strategically**
Don't micromanage, but do intervene when:
- Agents are going in circles
- They need more context you have
- They're off-topic
- A decision needs your input

### 5. **End Gracefully**
When the dialogue reaches a conclusion:
- Summarize the outcome
- Document decisions made
- Archive the session
- Reference it in future sessions if needed

## Integration with Your Workflow

### With Your CLAUDE.md Evidence Protocol

The agent dialogue system complements your evidence-based coding protocol:

1. **Contextual Evidence**: Have agents discuss and find 3 similar implementations
2. **Type Evidence**: Agents can remind each other to run type checks
3. **Execution Evidence**: Agents can review test results together

Example dialogue:
```
AGENT-1: I've reviewed the code. Before we proceed, let's ensure 
contextual evidence. Can you find 3 similar implementations in the codebase?

AGENT-2: I found these three:
- src/auth/validate.ts (lines 45-67)
- src/user/check.ts (lines 120-135)
- lib/security/verify.ts (lines 88-102)

All three use similar pattern with try/catch and early returns.

AGENT-1: Good. Now run type-check and paste the output.

AGENT-2: [runs npm run type-check]
Output: No type errors found.

AGENT-1: Approved. Now run tests and show execution evidence.
```

### With Version Control

The dialogue files can be committed to git:

```bash
# Add to git (optional)
git add agent-dialogue/conversation.md
git add agent-dialogue/status.json
git commit -m "Agent dialogue: security review of payment module"

# Or add to .gitignore if you prefer
echo "agent-dialogue/*.md" >> .gitignore
echo "agent-dialogue/*.json" >> .gitignore
echo "agent-dialogue/*.txt" >> .gitignore
```

### With CI/CD

You can trigger agent dialogues as part of CI:

```yaml
# Example GitHub Actions workflow
- name: Agent Code Review
  run: |
    # Set up dialogue topic
    # Trigger both agents via API
    # Wait for dialogue to complete
    # Parse results from conversation.md
```

## Advanced Usage

### Multiple Dialogue Channels

Create multiple dialogue directories for different topics:

```bash
mkdir -p agent-dialogue/security-review
mkdir -p agent-dialogue/performance-optimization
mkdir -p agent-dialogue/feature-design

# Copy protocol to each
cp agent-dialogue/PROTOCOL.md agent-dialogue/security-review/
cp agent-dialogue/PROTOCOL.md agent-dialogue/performance-optimization/
cp agent-dialogue/PROTOCOL.md agent-dialogue/feature-design/
```

### Three or More Agents

Modify `current-turn.txt` to support rotation:

```
AGENT-1  →  AGENT-2  →  AGENT-3  →  AGENT-1 ...
```

Update protocol to handle three agent IDs.

### Automated Session Management

Create a wrapper script:

```bash
#!/bin/bash
# start-dialogue.sh

TOPIC="$1"
AGENT1="$2"
AGENT2="$3"

# Update status.json with topic and participants
# Reset conversation.md with topic
# Set turn to AGENT-1
# Notify agents to begin
```

## Example Session

Here's what a typical session looks like:

```markdown
# Agent Dialogue Session

**Topic**: Review authentication security in login.ts

## Initial Context
File: src/auth/login.ts
Concern: Potential timing attack vulnerability
Focus: Line 45-67 password comparison logic

## Message #1 [AGENT-1] - 2025-10-16 10:30:15

I've reviewed the password comparison at lines 45-67. There's a timing 
attack vulnerability:

```typescript
if (userPassword === hashedPassword) {
  return true;
}
```

This uses standard string comparison which returns early on the first 
mismatched character, leaking information about the password.

### Recommendation
Use constant-time comparison: crypto.timingSafeEqual()

### Question for AGENT-2
Do you see any other security issues in the authentication flow?

---

## Message #2 [AGENT-2] - 2025-10-16 10:32:47

I agree with your timing attack assessment. Additionally, I notice:

1. **No rate limiting** on login attempts (line 23)
2. **Password not being compared as Buffer** (required for timingSafeEqual)
3. **No logging** of failed attempts

### Recommendations
1. Add rate limiting middleware
2. Convert strings to Buffer before comparison
3. Log failed attempts with IP address

### Code suggestion
```typescript
import { timingSafeEqual } from 'crypto';

const userPassBuf = Buffer.from(userPassword);
const hashBuf = Buffer.from(hashedPassword);

if (userPassBuf.length === hashBuf.length && 
    timingSafeEqual(userPassBuf, hashBuf)) {
  return true;
}
```

[AGREEMENT] on timing attack fix
[QUESTION-CRITICAL] Should we also add 2FA?

---

## Message #3 [AGENT-1] - 2025-10-16 10:35:12

[AGREEMENT] on all your points. Excellent catch on the rate limiting.

Regarding 2FA: [NEEDS-USER] This is a product decision. User should 
decide based on:
- User base expectations
- Compliance requirements
- Development timeline

### Summary
We agree on:
1. Fix timing attack with timingSafeEqual
2. Add rate limiting middleware
3. Add security logging
4. User to decide on 2FA

[PROPOSE-END] Security review complete with action items.

---
```

At this point, you review their discussion and implement their recommendations.

## Support and Feedback

This system is experimental but practical. It follows established patterns from:
- Multi-agent systems research
- Blackboard architectures
- Turn-based protocols
- File-based IPC

If you encounter issues or have suggestions, document them in:
- `agent-dialogue/ISSUES.md` (create this file)
- Your project's issue tracker

## Version History

- **v1.0.0** (2025-10-16): Initial implementation
  - Turn-based protocol
  - File-based communication
  - Lock mechanism
  - User command interface
  - Archival system

---

**Enjoy watching your agents collaborate!** 🤖💬🤖
