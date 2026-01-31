from agent.graph import agent
import sys
import traceback

def main():
    try: 
        user_prompt = input("Enter your project prompt: ")
        result = agent.invoke({ "user_prompt": user_prompt })
        print(result)
    except KeyboardInterrupt:
        print("\n Operation cancelled by user.")
        sys.exit(0)
    except Exception as e:
        traceback.print_exc()
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    
if __name__ == "__main__":
    main()
