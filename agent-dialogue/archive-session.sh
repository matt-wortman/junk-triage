#!/bin/bash
# Archive Agent Dialogue Session
# Usage: ./archive-session.sh "Session description"

DIALOGUE_DIR="agent-dialogue"
DESCRIPTION="$1"

if [ -z "$DESCRIPTION" ]; then
    echo "Usage: $0 \"Session description\""
    echo "Example: $0 \"Security review of payment module\""
    exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SESSION_DIR="$DIALOGUE_DIR/archive/session-$TIMESTAMP"

# Create archive directory
mkdir -p "$SESSION_DIR"

# Copy session files
echo "Archiving session..."

if [ -f "$DIALOGUE_DIR/conversation.md" ]; then
    cp "$DIALOGUE_DIR/conversation.md" "$SESSION_DIR/"
    echo "✓ Archived conversation.md"
else
    echo "⚠ conversation.md not found"
fi

if [ -f "$DIALOGUE_DIR/status.json" ]; then
    cp "$DIALOGUE_DIR/status.json" "$SESSION_DIR/"
    echo "✓ Archived status.json"
else
    echo "⚠ status.json not found"
fi

# Create session metadata
cat > "$SESSION_DIR/session-info.txt" << EOF
Session Archived: $(date)
Description: $DESCRIPTION
Session Directory: $SESSION_DIR
EOF

echo "✓ Created session-info.txt"

# Optional: Reset dialogue files for new session
read -p "Reset dialogue files for new session? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Reset current-turn.txt
    echo "USER" > "$DIALOGUE_DIR/current-turn.txt"
    echo "✓ Reset current-turn.txt to USER"
    
    # Reset status.json
    cat > "$DIALOGUE_DIR/status.json" << 'EOF'
{
  "session_id": "session-new",
  "created": null,
  "current_turn": "USER",
  "message_count": 0,
  "last_update": null,
  "last_speaker": null,
  "topic": "To be set by user",
  "status": "initialized",
  "participants": {
    "AGENT-1": "Not configured",
    "AGENT-2": "Not configured"
  },
  "session_notes": "New session"
}
EOF
    echo "✓ Reset status.json"
    
    # Keep conversation.md header but clear messages
    cat > "$DIALOGUE_DIR/conversation.md" << 'EOF'
# Agent Dialogue Session

**Session ID**: session-new  
**Started**: (to be set when session begins)  
**Topic**: (to be set by user)  
**Participants**: AGENT-1 and AGENT-2

---

## Instructions for Agents

Before writing your first message:
1. Read `PROTOCOL.md` in full
2. Check `current-turn.txt` to confirm it's your turn
3. Read `status.json` for session metadata
4. Check `user-commands.txt` for any user instructions

When writing your message:
- Use the format: `## Message #N [YOUR-ID] - YYYY-MM-DD HH:MM:SS`
- Append to the END of this file (do not modify previous messages)
- Update `status.json` after writing
- Write the other agent's ID to `current-turn.txt` to pass the turn

---

## Initial Context

(User will provide initial context here when starting a session)

---

## Conversation Begins Below

EOF
    echo "✓ Reset conversation.md"
    
    # Clear user commands
    cat > "$DIALOGUE_DIR/user-commands.txt" << 'EOF'
# User Commands

# This file is read by agents before each turn.
# Add commands here to control the dialogue session.
# Remove or comment out commands once they've been processed.

# Available commands:
# - PAUSE: Stop agents from participating until RESUME
# - RESUME: Continue after PAUSE
# - RESET: Start a new conversation (archive current)
# - SWITCH-TOPIC: [new topic description]
# - END-SESSION: Conclude the dialogue
# - PRIORITY: [urgent message to agents]
# - AGENT-1-ONLY: Only AGENT-1 should respond next
# - AGENT-2-ONLY: Only AGENT-2 should respond next

# No active commands - agents may proceed normally
EOF
    echo "✓ Reset user-commands.txt"
    
    # Remove any stale lock
    if [ -f "$DIALOGUE_DIR/lock.txt" ]; then
        rm "$DIALOGUE_DIR/lock.txt"
        echo "✓ Removed stale lock.txt"
    fi
fi

echo ""
echo "Session archived successfully!"
echo "Location: $SESSION_DIR"
echo ""
echo "To reference this session:"
echo "  Session ID: session-$TIMESTAMP"
echo "  Description: $DESCRIPTION"
