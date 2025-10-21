#!/bin/bash
# Agent Dialogue Monitor
# This script displays the current state of an agent dialogue session

DIALOGUE_DIR="agent-dialogue"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Agent Dialogue Monitor${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if directory exists
if [ ! -d "$DIALOGUE_DIR" ]; then
    echo -e "${RED}Error: $DIALOGUE_DIR directory not found${NC}"
    exit 1
fi

# Current Turn
echo -e "${GREEN}Current Turn:${NC}"
if [ -f "$DIALOGUE_DIR/current-turn.txt" ]; then
    TURN=$(cat "$DIALOGUE_DIR/current-turn.txt" | tr -d '\n')
    echo -e "  ${YELLOW}$TURN${NC}"
else
    echo -e "  ${RED}current-turn.txt not found${NC}"
fi
echo ""

# Session Status
echo -e "${GREEN}Session Status:${NC}"
if [ -f "$DIALOGUE_DIR/status.json" ]; then
    TOPIC=$(jq -r '.topic' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Unknown")
    MSG_COUNT=$(jq -r '.message_count' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Unknown")
    LAST_UPDATE=$(jq -r '.last_update' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Not yet")
    STATUS=$(jq -r '.status' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Unknown")
    AGENT1=$(jq -r '.participants.AGENT-1' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Unknown")
    AGENT2=$(jq -r '.participants.AGENT-2' "$DIALOGUE_DIR/status.json" 2>/dev/null || echo "Unknown")
    
    echo "  Topic: $TOPIC"
    echo "  Messages: $MSG_COUNT"
    echo "  Last Update: $LAST_UPDATE"
    echo "  Status: $STATUS"
    echo "  Agent 1: $AGENT1"
    echo "  Agent 2: $AGENT2"
else
    echo -e "  ${RED}status.json not found${NC}"
fi
echo ""

# Lock Status
echo -e "${GREEN}Lock Status:${NC}"
if [ -f "$DIALOGUE_DIR/lock.txt" ]; then
    LOCK_OWNER=$(cat "$DIALOGUE_DIR/lock.txt" | tr -d '\n')
    LOCK_TIME=$(stat -c %Y "$DIALOGUE_DIR/lock.txt" 2>/dev/null || stat -f %m "$DIALOGUE_DIR/lock.txt" 2>/dev/null)
    CURRENT_TIME=$(date +%s)
    LOCK_AGE=$((CURRENT_TIME - LOCK_TIME))
    
    echo -e "  ${YELLOW}LOCKED by $LOCK_OWNER${NC}"
    echo "  Lock age: ${LOCK_AGE}s"
    
    if [ $LOCK_AGE -gt 60 ]; then
        echo -e "  ${RED}WARNING: Stale lock detected (>60s)${NC}"
        echo "  Consider removing: rm $DIALOGUE_DIR/lock.txt"
    fi
else
    echo "  Unlocked"
fi
echo ""

# User Commands
echo -e "${GREEN}Active User Commands:${NC}"
if [ -f "$DIALOGUE_DIR/user-commands.txt" ]; then
    COMMANDS=$(grep -v '^#' "$DIALOGUE_DIR/user-commands.txt" | grep -v '^[[:space:]]*$')
    if [ -z "$COMMANDS" ]; then
        echo "  None"
    else
        echo "$COMMANDS" | sed 's/^/  /'
    fi
else
    echo -e "  ${RED}user-commands.txt not found${NC}"
fi
echo ""

# Recent Conversation
echo -e "${GREEN}Recent Conversation (last 15 lines):${NC}"
echo -e "${BLUE}--------------------------------${NC}"
if [ -f "$DIALOGUE_DIR/conversation.md" ]; then
    tail -n 15 "$DIALOGUE_DIR/conversation.md"
else
    echo -e "${RED}conversation.md not found${NC}"
fi
echo -e "${BLUE}--------------------------------${NC}"
echo ""

# Live monitoring option
echo -e "${YELLOW}Press Ctrl+C to exit or run with --watch to auto-refresh${NC}"
echo ""

# Watch mode
if [ "$1" == "--watch" ]; then
    echo "Watching for changes... (Ctrl+C to stop)"
    while true; do
        sleep 3
        bash "$0"
    done
fi
