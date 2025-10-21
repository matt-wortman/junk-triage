#!/bin/bash
# Interactive Session Starter for Agent Dialogue System
# This script helps you set up a new dialogue session by prompting for all necessary information

DIALOGUE_DIR="agent-dialogue"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Agent Dialogue Session Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Generate default session ID with timestamp
DEFAULT_SESSION_ID="session-$(date +%Y%m%d-%H%M%S)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo -e "${GREEN}1. Session ID${NC}"
echo -e "   ${CYAN}(Press Enter to use: $DEFAULT_SESSION_ID)${NC}"
read -p "   Enter session ID: " SESSION_ID
SESSION_ID=${SESSION_ID:-$DEFAULT_SESSION_ID}
echo ""

echo -e "${GREEN}2. Topic${NC}"
echo -e "   ${CYAN}What will the agents discuss?${NC}"
echo -e "   ${CYAN}Example: Review payment processing for security vulnerabilities${NC}"
read -p "   Enter topic: " TOPIC
echo ""

echo -e "${GREEN}3. Agent Names${NC}"
echo -e "   ${CYAN}Example: Cline, Claude, Cursor, Windsurf, etc.${NC}"
read -p "   Enter AGENT-1 name: " AGENT1
read -p "   Enter AGENT-2 name: " AGENT2
echo ""

echo -e "${GREEN}4. Session Notes${NC}"
echo -e "   ${CYAN}Optional description (Press Enter to skip)${NC}"
read -p "   Enter notes: " NOTES
NOTES=${NOTES:-"No additional notes"}
echo ""

echo -e "${GREEN}5. Initial Context${NC}"
echo -e "   ${CYAN}What context should the agents have?${NC}"
echo -e "   ${CYAN}You can provide it now or edit conversation.md later.${NC}"
read -p "   Provide initial context? (y/n): " PROVIDE_CONTEXT
echo ""

CONTEXT=""
if [[ $PROVIDE_CONTEXT =~ ^[Yy]$ ]]; then
    echo -e "   ${CYAN}Enter context (type 'END' on a new line when done):${NC}"
    while IFS= read -r line; do
        if [ "$line" = "END" ]; then
            break
        fi
        CONTEXT="${CONTEXT}${line}\n"
    done
    echo ""
fi

echo -e "${GREEN}6. Starting Agent${NC}"
echo -e "   ${CYAN}Which agent should go first?${NC}"
echo "   1) AGENT-1 ($AGENT1)"
echo "   2) AGENT-2 ($AGENT2)"
echo "   3) USER (I'll start the conversation)"
read -p "   Choice [1/2/3]: " START_CHOICE

case $START_CHOICE in
    1)
        STARTING_TURN="AGENT-1"
        ;;
    2)
        STARTING_TURN="AGENT-2"
        ;;
    3)
        STARTING_TURN="USER"
        ;;
    *)
        STARTING_TURN="AGENT-1"
        echo -e "   ${YELLOW}Invalid choice, defaulting to AGENT-1${NC}"
        ;;
esac
echo ""

# Show summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Session Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}Session ID:${NC} $SESSION_ID"
echo -e "${GREEN}Created:${NC} $TIMESTAMP"
echo -e "${GREEN}Topic:${NC} $TOPIC"
echo -e "${GREEN}Agent 1:${NC} $AGENT1"
echo -e "${GREEN}Agent 2:${NC} $AGENT2"
echo -e "${GREEN}Notes:${NC} $NOTES"
echo -e "${GREEN}Starting Turn:${NC} $STARTING_TURN"
echo ""

read -p "Create this session? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Session creation cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Creating session files...${NC}"
echo ""

# Create status.json
cat > "$DIALOGUE_DIR/status.json" << EOF
{
  "session_id": "$SESSION_ID",
  "created": "$TIMESTAMP",
  "current_turn": "$STARTING_TURN",
  "message_count": 0,
  "last_update": null,
  "last_speaker": null,
  "topic": "$TOPIC",
  "status": "active",
  "participants": {
    "AGENT-1": "$AGENT1",
    "AGENT-2": "$AGENT2"
  },
  "session_notes": "$NOTES"
}
EOF
echo -e "${GREEN}✓${NC} Created status.json"

# Create/update current-turn.txt
echo "$STARTING_TURN" > "$DIALOGUE_DIR/current-turn.txt"
echo -e "${GREEN}✓${NC} Set current turn to $STARTING_TURN"

# Create conversation.md
CONTEXT_SECTION="(User will provide initial context here when starting a session)"
if [ ! -z "$CONTEXT" ]; then
    CONTEXT_SECTION=$(echo -e "$CONTEXT")
fi

cat > "$DIALOGUE_DIR/conversation.md" << EOF
# Agent Dialogue Session

**Session ID**: $SESSION_ID  
**Started**: $TIMESTAMP  
**Topic**: $TOPIC  
**Participants**: $AGENT1 (AGENT-1) and $AGENT2 (AGENT-2)

---

## Instructions for Agents

Before writing your first message:
1. Read \`PROTOCOL.md\` in full
2. Check \`current-turn.txt\` to confirm it's your turn
3. Read \`status.json\` for session metadata
4. Check \`user-commands.txt\` for any user instructions

When writing your message:
- Use the format: \`## Message #N [YOUR-ID] - YYYY-MM-DD HH:MM:SS\`
- Append to the END of this file (do not modify previous messages)
- Update \`status.json\` after writing
- Write the other agent's ID to \`current-turn.txt\` to pass the turn

---

## Initial Context

$CONTEXT_SECTION

---

## Conversation Begins Below

EOF
echo -e "${GREEN}✓${NC} Created conversation.md"

# Clear user commands
cat > "$DIALOGUE_DIR/user-commands.txt" << EOF
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
echo -e "${GREEN}✓${NC} Reset user-commands.txt"

# Remove any stale lock file
if [ -f "$DIALOGUE_DIR/lock.txt" ]; then
    rm "$DIALOGUE_DIR/lock.txt"
    echo -e "${GREEN}✓${NC} Removed stale lock.txt"
fi

echo ""
echo -e "${GREEN}Session created successfully!${NC}"
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Next Steps${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

if [ -z "$CONTEXT" ]; then
    echo -e "${YELLOW}1. Add initial context to conversation.md${NC}"
    echo -e "   nano $DIALOGUE_DIR/conversation.md"
    echo ""
fi

if [ "$STARTING_TURN" = "AGENT-1" ]; then
    echo -e "${YELLOW}2. Instruct $AGENT1 (AGENT-1) to begin:${NC}"
    echo ""
    echo -e "   ${CYAN}\"Please read and follow the protocol in agent-dialogue/PROTOCOL.md.${NC}"
    echo -e "   ${CYAN}Check agent-dialogue/current-turn.txt to confirm it's your turn.${NC}"
    echo -e "   ${CYAN}Read agent-dialogue/conversation.md for context.${NC}"
    echo -e "   ${CYAN}Write your response and pass the turn to AGENT-2.\"${NC}"
    echo ""
    echo -e "${YELLOW}3. Instruct $AGENT2 (AGENT-2) to wait:${NC}"
    echo ""
    echo -e "   ${CYAN}\"Please read and follow the protocol in agent-dialogue/PROTOCOL.md.${NC}"
    echo -e "   ${CYAN}Wait for agent-dialogue/current-turn.txt to show 'AGENT-2'.${NC}"
    echo -e "   ${CYAN}When it's your turn, read agent-dialogue/conversation.md and respond.${NC}"
    echo -e "   ${CYAN}Pass the turn back to AGENT-1 when done.\"${NC}"
elif [ "$STARTING_TURN" = "AGENT-2" ]; then
    echo -e "${YELLOW}2. Instruct $AGENT2 (AGENT-2) to begin:${NC}"
    echo ""
    echo -e "   ${CYAN}\"Please read and follow the protocol in agent-dialogue/PROTOCOL.md.${NC}"
    echo -e "   ${CYAN}Check agent-dialogue/current-turn.txt to confirm it's your turn.${NC}"
    echo -e "   ${CYAN}Read agent-dialogue/conversation.md for context.${NC}"
    echo -e "   ${CYAN}Write your response and pass the turn to AGENT-1.\"${NC}"
    echo ""
    echo -e "${YELLOW}3. Instruct $AGENT1 (AGENT-1) to wait:${NC}"
    echo ""
    echo -e "   ${CYAN}\"Please read and follow the protocol in agent-dialogue/PROTOCOL.md.${NC}"
    echo -e "   ${CYAN}Wait for agent-dialogue/current-turn.txt to show 'AGENT-1'.${NC}"
    echo -e "   ${CYAN}When it's your turn, read agent-dialogue/conversation.md and respond.${NC}"
    echo -e "   ${CYAN}Pass the turn back to AGENT-2 when done.\"${NC}"
else
    echo -e "${YELLOW}2. Add your initial message to conversation.md${NC}"
    echo ""
    echo -e "${YELLOW}3. Set the turn to start the agents:${NC}"
    echo -e "   echo \"AGENT-1\" > $DIALOGUE_DIR/current-turn.txt"
    echo ""
    echo -e "${YELLOW}4. Instruct both agents to follow the protocol${NC}"
fi

echo ""
echo -e "${YELLOW}4. Monitor the conversation:${NC}"
echo -e "   tail -f $DIALOGUE_DIR/conversation.md"
echo -e "   ${CYAN}or${NC}"
echo -e "   ./$DIALOGUE_DIR/monitor.sh"
echo ""
echo -e "${GREEN}Happy collaborating! 🤖💬🤖${NC}"
