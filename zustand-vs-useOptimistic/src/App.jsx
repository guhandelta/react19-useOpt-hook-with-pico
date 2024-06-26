import { create } from 'zustand';


/*
  If the state management library already has featrues/functionalities to perform Optimistic on the state, then it would be wise/best to utilize teh state manager for Optimistic updates,instead of using useOptiistic() hooks, but if that is not the case the useOptimistic would be the best choice to perform Optimistic updates on the state when using basic Hooks.
*/


async function getTodos(){
  const res = await fetch("http://localhost:8080/api/todos")
  return await res.json();
}

async function addTodo(text){
  const res = await fetch("http://localhost:8080/api/todos",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  
  if(!res.ok) throw new Error("Failed to add a Todo");
  return await res.json();
}

const useTodos = create((set, get) => ({
  // Initial State
  todos: [],
  // To disable or enable the Textfield
  isPending: false,

  // Get all teh todos by calling the getTodos()
  getTodos: async () => {
    const todos = await getTodos()
    set({ todos });
  },
  postTodo: async (text) => {
    // Cache the initial todos
    const originalTodos = get().todos;
    // Create the Optimistic update
    set({
      isPending: true,
      // Update the todos with an optimistic array
      todos: [
        ...get().todos,
        {
          id: Math.random().toString(36).slice(2),
          text
        }
      ]
    });

    // Handle the API calls within a try-catch
    try {
      await addTodo(text);
      set({ 
        isPending: false,
        todos: await getTodos()
      })
    } catch (error) {
      console.log("Error:\t", error);
      set({ 
        isPending: false,
        todos: originalTodos
      })
    }
  }
}))

// To kick this off, call the getState() on useTodos, to get the current store and call the getTodos() to fetch all the todos for initial render. 
// This is in place of useEffect(() => {}, [])
useTodos.getState().getTodos();

function App() {

  const { isPending, todos, postTodo } = useTodos();
  
  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {todos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
      <div>
        <input 
          type="text" 
          disabled={isPending}
          onKeyUp={(e) => {
            if(e.key === "Enter"){
              postTodo(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>
    </>
  )
}

export default App
