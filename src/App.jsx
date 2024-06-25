import { useEffect, useState, useOptimistic } from 'react'
import './App.css'

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

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState([])

  useEffect(() => { 
    getTodos().then(setTodos);
  }, [])

  async function addNewTodo(){
    // This is the function based approach, by providing it the current  state(the updated state canalso be provided here), to Set the Optimistic Todos with the current Todos, and create a new Todo with a random ID and the Todos with te new Todo
    setOptimisticTodos((todos) => [
      ...todos,
      {
        id: Math.random().toString(36).slice(2),
        text: newTodo
      }
    ]);
    /* 
    This would actually throw an error in the browser console, as this setOptimistic() was not called within an action or a transition
    
    VM268401:1 An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition. */


    await addTodo(newTodo);
    setTodos(await getTodos());
    setNewTodo("");
  }
  // Invoke useOptimistic() and provide the todos, which will give optimistic Todos => It will share the updated state, to say this is what the to-dos will look like if the update suceeds
  const [ optimisticTodos, setOptimisticTodos ] = useOptimistic(todos)

  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {todos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
      <div className="">
        <input 
          type="text" 
          value={newTodo}
          onChange={ e => setNewTodo(e.target.value) } 
          onKeyUp={ e => {
              if(e.key === "Enter") addNewTodo()
            }
          }
        />
      </div>
    </>
  )
}

export default App
