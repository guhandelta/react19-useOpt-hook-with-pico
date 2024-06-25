import { useEffect, useState, useOptimistic, useTransition } from 'react'
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
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState([]);
  const [ isPending, startTransition ] = useTransition();

  console.log("IsPending:\t", isPending);

  useEffect(() => { 
    getTodos().then(setTodos);
  }, []);

  // Invoke useOptimistic() and provide the todos, which will give optimistic Todos => It will share the updated state, to say this is what the to-dos will look like if the update suceeds
  const [ optimisticTodos, setOptimisticTodos ] = useOptimistic(todos)

  async function addNewTodo(){
    // This is the function based approach, by providing it the current  state(the updated state canalso be provided here), to Set the Optimistic Todos with the current Todos, and create a new Todo with a random ID and the Todos with te new Todo
    setOptimisticTodos((todos) => [
      ...todos,
      {
        id: Math.random().toString(36).slice(2),
        text: newTodo // Provide a value for the text property
      }
    ]);
    /* 
    This would actually throw an error in the browser console, as this setOptimistic() was not called within an action or a transition, because only during a transition or an action, the useOptimistic() will know when the operation started and ended. React throws this error meaning to say that it is supposed to provide the optimistic data, only after the request was made to update the state and before the response arrives, but the error actually is to say that React doesn't know when the request was initiates and completed.

    1) Wrapping the useOptimistic within a transition,
      -> After the transition starts -> Provide the Optimistic State/Data.
      -> When the transition completes -> Go back to the real data which is the output of the update.

    2) using useOptimistic with a FormAction
      -> Anything that is happends during the FormAction processing time is a part of the Optimistic Update
      -> Get the Optimistic data in the beginning -and then- when the action resolves, the real data would be available

    VM268401:1 An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition. */

    await addTodo(newTodo);
    setTodos(await getTodos());
    setNewTodo("");
  }
  
  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {optimisticTodos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
      <div className="">
        <input 
          type="text" 
          value={newTodo}
          onChange={ e => setNewTodo(e.target.value) } 
          onKeyUp={ e => {
              if(e.key === "Enter") 
                // Calling addNewTodo as a part of startTransition()
                startTransition(() => addNewTodo());

            }
          }
        />
      </div>
    </>
  )
}

export default App
