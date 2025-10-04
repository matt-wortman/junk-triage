# Playwright MCP Server WSL2 High-DPI Context Window Fix Guide

## Problem Statement
When using Claude Code with the Playwright MCP server in WSL2 on Windows 11, screenshots are consuming excessive context window space due to high-resolution rendering on high-DPI displays. Chrome windows opened by Playwright show very small text despite 100% magnification, indicating they're rendering at native high resolution.

## Root Causes

### 1. WSL2 DPI Scaling Issues
- WSL2 doesn't properly handle fractional DPI scaling (125%, 150%, etc.)
- WSLg only supports 100% and 200% scaling, not intermediate values
- GUI applications in WSL2 render at native resolution without Windows scaling

### 2. Playwright Default Behavior
- Playwright captures screenshots at the full rendered resolution
- Default deviceScaleFactor may be set too high for high-DPI displays
- No viewport size constraints by default in MCP server

### 3. Context Window Impact
- High-resolution screenshots (e.g., 4K) can use 8-10K tokens each
- Multiple screenshots quickly exhaust available context
- Automatic screenshot capture compounds the issue

## Solutions to Implement

### Solution 1: Configure Playwright MCP Server Viewport (RECOMMENDED - Start Here)

**Location**: Your MCP configuration file (varies by IDE)
- VS Code: `~/.vscode/mcp.json`
- Cursor: `~/.cursor/mcp.json`
- Claude Code: Check documentation for specific location

**Configuration to add:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--viewport-size", "1280x720"
      ]
    }
  }
}
```

**Alternative with more options:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--viewport-size", "1280x720",
        "--browser", "chromium"
      ]
    }
  }
}
```

### Solution 2: Use Configuration File Instead of CLI Args

Create a config file at `~/playwright-mcp-config.json`:

```json
{
  "browser": {
    "browserName": "chromium",
    "launchOptions": {
      "channel": "chrome",
      "headless": false
    },
    "contextOptions": {
      "viewport": {
        "width": 1280,
        "height": 720
      },
      "deviceScaleFactor": 1
    }
  },
  "capabilities": ["pdf", "vision"],
  "server": {
    "port": 8931,
    "host": "localhost"
  }
}
```

Then update MCP configuration to use the config file:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--config", "/home/YOUR_USERNAME/playwright-mcp-config.json"
      ]
    }
  }
}
```

### Solution 3: Fix WSL2 DPI Scaling (For Better Visual Experience)

**Step 1**: Create WSLg configuration file

In Windows (not WSL), create file at: `C:\Users\YOUR_WINDOWS_USERNAME\.wslgconfig`

**Step 2**: Add configuration:

```ini
[system-distro-env]
WESTON_RDP_DISABLE_FRACTIONAL_HI_DPI_SCALING=false
WESTON_RDP_FRACTIONAL_HI_DPI_SCALING=true
```

**Step 3**: Restart WSL

Open PowerShell as Administrator and run:
```powershell
wsl --shutdown
```

Then restart WSL/Claude Code.

### Solution 4: Environment Variable Approach (Alternative to .wslgconfig)

Add to your `~/.bashrc` or `~/.zshrc` in WSL:

```bash
# DPI Scaling for GUI apps in WSL2
export GDK_SCALE=1.5           # Adjust value as needed (1.5 = 150%)
export GDK_DPI_SCALE=1.5       # Match GDK_SCALE value
export QT_SCALE_FACTOR=1.5     # For Qt applications
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Implementation Steps for Claude Code

1. **First, try Solution 1** - It's the simplest and most direct approach
2. **If viewport is still too large**, implement Solution 2 with explicit deviceScaleFactor: 1
3. **For visual comfort** (if text is too small), implement Solution 3 or 4
4. **Test the configuration** by:
   - Taking a screenshot with Playwright
   - Checking if text is readable
   - Monitoring context window usage

## Verification Commands

After making changes, verify the setup:

```bash
# Check if Playwright MCP server starts with new config
npx @playwright/mcp@latest --help

# Test viewport settings (if you have a test script)
# The screenshot should be 1280x720 pixels
```

## Best Practices for Context Conservation

1. **Use element-specific screenshots** instead of full page when possible
2. **Disable automatic screenshots** unless specifically needed
3. **Set explicit viewport dimensions** (1280x720 or 1920x1080 maximum)
4. **Use deviceScaleFactor: 1** to reduce pixel density
5. **Clear browser cache/data periodically** to reduce memory usage

## Troubleshooting

### If changes don't take effect:
1. Fully restart Claude Code (not just reload)
2. Check JSON syntax in configuration files
3. Verify file paths are correct
4. Run `wsl --shutdown` and restart if WSL changes were made

### If text is still too small:
1. Increase viewport size slightly (e.g., 1920x1080)
2. Adjust GDK_SCALE environment variable
3. Consider using headless mode if visual inspection isn't required

### If context window still fills quickly:
1. Reduce viewport size further (e.g., 1024x768)
2. Limit screenshot frequency in your automation
3. Use text-based assertions instead of visual verification where possible

## Expected Results

After implementing these fixes:
- Screenshot file sizes should reduce by 50-75%
- Context window should last 3-4x longer
- Chrome windows should display at a more reasonable size
- Text should be readable without magnification

## Notes for Claude Code

When implementing these fixes:
1. Start with the MCP server configuration changes (Solution 1 or 2)
2. These don't require sudo/admin privileges
3. Configuration file changes require service restart
4. Monitor the impact on context usage after each change
5. The viewport-size argument is the most impactful single change

## Additional Resources

- Playwright MCP Server docs: https://github.com/microsoft/playwright-mcp
- WSLg documentation: https://github.com/microsoft/wslg
- Playwright viewport configuration: https://playwright.dev/docs/api/class-browser#browser-new-context
