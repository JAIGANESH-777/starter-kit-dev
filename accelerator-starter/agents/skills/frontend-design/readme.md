# 🤖 Frontend Design AI Agent Skill

## What is this?
This folder contains the localized engineering and design laws for AI agents (`Antigravity`, `Cursor`, `Claude Code`) working on this repository.

Instead of relying on a global installation via `npx skills`, keeping this file here ensures that the AI automatically inherits our strict UI principles the moment the workspace is opened.

## ⚠️ Important Rules for Developers
- **DO NOT delete this folder.** It acts as an active guardrail preventing the AI from generating generic "AI slop" or templated UI layouts.
- **Source tracking**: This skill was originally pulled from the official Anthropic skills registry (`https://github.com/anthropics/skills`).
- If you need to update or tune the AI's design behavior, modify the rules directly inside `SKILL.md`.
