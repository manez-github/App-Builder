# App-Builder

An AI-powered application that generates fully functional, interactive applications from a single natural-language prompt. Built using a multi-agent pipeline with [LangGraph](https://github.com/langchain-ai/langgraph) and powered by a Groq-hosted LLM.

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## How It Works

App-Builder uses a three-stage agent pipeline, where each agent has a clearly defined responsibility:

**1. Planner** — Takes your natural-language prompt and produces a high-level project plan: the app name, a description, the recommended tech stack, a list of features, and the files that need to be created.

**2. Architect** — Receives the plan and breaks it down into an ordered list of granular implementation tasks. Each task is tied to a specific file and includes details on functions, variables, event handlers, dependencies, and integration points. Tasks are ordered so that dependencies come first.

**3. Coder** — Iterates through each implementation task one at a time. For every task it reads existing project files for context, constructs a detailed prompt, and invokes a ReAct agent equipped with file-system tools (`read_file`, `write_file`, `list_files`, `get_current_directory`) to write complete, working code. It loops back on itself until every task in the plan is finished.

All generated files are written to a `generated_project/` directory in your working directory. A path-safety check ensures no file is ever written outside that root.

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Demo

See App-Builder in action — both apps below were generated entirely from a single prompt, with zero manual coding.

### 🧮 Calculator Web App

A fully functional calculator app with support for basic arithmetic operations.

<video controls width="100%">
  <source src="https://github.com/manez-github/App-Builder/blob/main/assets/project_demo_videos/todo-list.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### ✅ To-Do List Web App

An interactive to-do list app with the ability to add, edit, and delete tasks.

<video controls width="100%">
  <source src="https://github.com/manez-github/App-Builder/blob/main/assets/project_demo_videos/todo-list.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Project Structure

```
App-Builder/
├── main.py                  # Entry point — reads user input and invokes the agent graph
├── agent/
│   ├── graph.py             # LangGraph StateGraph definition and agent node logic
│   ├── prompts.py           # Prompt templates for each agent stage
│   ├── states.py            # Pydantic schemas (plan, TaskPlan, CoderState, etc.)
│   └── tools.py             # File-system tools exposed to the Coder agent
├── pyproject.toml           # Project metadata and dependencies (managed by uv)
├── uv.lock                  # Locked dependency manifest
├── .python-version          # Python version pin
└── .gitignore
```

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Prerequisites

- **Python 3.12+** (version is pinned in `.python-version`)
- **[uv](https://docs.astral.sh/uv/)** — the package manager used by this project
- A **Groq API key** (the project uses the `moonshotai/kimi-k2-instruct-0905` model via Groq)

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Setup

### Option 1 — Clone the repository

This is the quickest way to get started. All dependencies are already locked in `uv.lock`.

```powershell
git clone https://github.com/manez-github/App-Builder.git
cd App-Builder
uv sync
```

### Option 2 — Initialize from scratch

Use this if you want to set up the project manually.

**Initialize a new uv project in the current directory**
```powershell
uv init
```

**Create a virtual environment for the project**
```powershell
uv venv
```

**Install the LangChain core library for agent and tool abstractions**
```powershell
uv add langchain
```

**Install python-dotenv to load environment variables from a `.env` file**
```powershell
uv add python-dotenv
```

**Install LangGraph for multi-agent graph orchestration**
```powershell
uv add langgraph
```

**Install additional LangChain packages required for community integrations and core functionality**
```powershell
uv add langchain langchain-core langchain-community
```

**Install the Groq integration to connect to the Groq-hosted LLM**
```powershell
uv add langchain-groq
```

Then copy the source files (`main.py` and the `agent/` folder) into your project directory.

### Configure your API key (both methods)

Create a `.env` file in the project root:

```powershell
GROQ_API_KEY=your_groq_api_key_here
```

The project uses `python-dotenv` to load this automatically at startup.

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Usage

```powershell
uv run python main.py
```

You will be prompted to enter a description of the app you want to build:

```
Enter your project prompt: Build a simple calculator web app
```

The three agents will run in sequence. Once they finish, your generated application will be in the `generated_project/` directory, ready to open or run.

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Key Design Decisions

**Structured outputs at every stage.** The Planner and Architect use Pydantic models (`plan`, `TaskPlan`) as structured output schemas, so their responses are always machine-parseable — no fragile string parsing needed.

**Iterative coding loop.** The Coder agent doesn't try to write the entire project in one shot. It processes one file at a time, reading back previously written files as context. This keeps each LLM call focused and reduces the chance of inconsistencies across files.

**Sandboxed file system.** All file operations are scoped to `generated_project/` via `safe_path_for_project()`. Any attempt to read or write outside that directory raises an error.

**ReAct agent for code generation.** Rather than just asking the LLM to return code as text, the Coder stage uses a LangChain ReAct agent with real tools. This means the LLM can read existing files, reason about what to write, and then call `write_file` — a more reliable loop than hoping the model formats an entire file correctly in one response.

<img src="https://github.com/manez-github/App-Builder/blob/main/assets/images/separator.svg" width="100%" height="4">

## Dependencies

| Package | Purpose |
|---|---|
| `langchain-groq` | Groq LLM integration |
| `langgraph` | Multi-agent graph orchestration |
| `langchain` | ReAct agent, tool abstractions |
| `pydantic` | Structured output schemas |
| `python-dotenv` | Environment variable loading |



