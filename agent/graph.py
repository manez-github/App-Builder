from langchain_groq import ChatGroq
from langgraph.graph import StateGraph
from langgraph.constants import END
from langchain.agents import create_agent

from pydantic import BaseModel, Field
from dotenv import load_dotenv
load_dotenv()

from .prompts import *
from .states import *
from .tools import *

from langchain_core.globals import set_debug, set_verbose
set_debug(True)
set_verbose(True)

llm = ChatGroq(model="moonshotai/kimi-k2-instruct-0905", max_tokens=16384)

def planner_agent(state: dict) -> dict:
    user_prompt = state['user_prompt']
    planner_prompt = create_planner_prompt(user_prompt)
    resp = llm.with_structured_output(plan).invoke(planner_prompt)
    if resp is None: 
        raise ValueError("Planner did not return a valid response.")
    return { "plan": resp }

def architect_agent(state: dict) -> dict:
    plan = state['plan']
    architect_prompt = create_architect_prompt(plan)
    resp = llm.with_structured_output(TaskPlan).invoke(architect_prompt)
    if resp is None: 
        raise ValueError("Architect did not return a valid response.")
    return { "task_plan": resp}

def coder_agent(state: dict) -> dict:
    coder_state = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state['task_plan'], current_step_idx=0)
        
    steps = coder_state.task_plan.implementation_steps
    
    if coder_state.current_step_idx >= len(steps):
        return { "coder_state": coder_state, "status": "DONE"}
    
    current_task = steps[coder_state.current_step_idx]
    existing_content = read_file.run(current_task.filepath)
    
    context = "=== EXISTING PROJECT FILES ===\n"
    for step_idx in range(coder_state.current_step_idx):
        prev_task = steps[step_idx]
        prev_content = read_file.run(prev_task.filepath)
        if prev_content: 
            context = context + f"\n--- {prev_task.filepath} ---\n{prev_content}\n"
            
    task_prompt = (
        f"{context}\n"
        f"Task: {current_task.task_description}\n"
        f"Path: {current_task.filepath}\n"
        f"CRITICAL REQUIREMENTS:\n"
        f"1. Create FULLY FUNCTIONAL, INTERACTIVE code - not just diaplay/layout \n"
        f"2. For web apps: ALL buttons and inputs MUST have working event handlers \n"
        f"3. For Javascript: Ensure ALL DOM elements are correctly selected and events properly bound \n"
        f"4. For forms/calculators: Implement COMPLETE logic for calculations, validations and updates \n"
        f"5. Test your logic mentally - walk through user interactions step-by-step \n"
        f"6. NO placeholders or TO DO comments - write COMPLETE implementations \n"
        f"7. If using frameworks of Javascript, Ensure proper component lifecycle and state management \n\n"
        f"Existing content in {current_task.filepath}: \n{existing_content} or empty file. \n\n"
        f"You MUST call write_file(path={current_task.filepath}, content=your_complete_code) to save the implementation."
        f"In short you MUST use the tools given to write files to save them.")
    
    coder_system_prompt = create_coder_system_prompt()
    
    coder_tools = [read_file, write_file, list_files, get_current_directory]
    react_agent = create_agent(llm, coder_tools)
    react_agent.invoke({"messages" : [{"role": "system", "content": coder_system_prompt},
                                      {"role": "user", "content": task_prompt}]})
    
    coder_state.current_step_idx = coder_state.current_step_idx + 1
    return { "coder_state": coder_state }

graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge(start_key="planner", end_key="architect")
graph.add_edge(start_key="architect", end_key="coder")
graph.add_conditional_edges("coder", 
                            lambda s: "END" if s.get("status") == "DONE" else "coder",
                            { "END": END, "coder": "coder" })

graph.set_entry_point("planner")

agent = graph.compile()

if __name__ == "__main__":
    user_prompt = "Build a simple calculator web app"
    result = agent.invoke({"user_prompt": user_prompt})
    print(result) 



