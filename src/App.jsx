import { useEffect, useState, useOptimistic, useTransition, useRef } from 'react'
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

  // ref to reset the form data post submission
  const formRef = useRef();

  useEffect(() => { 
    getTodos().then(setTodos);
  }, []);

  /* Invoke useOptimistic() and provide the todos, which will give optimistic Todos => It will share the updated state, to say this is what the to-dos will look like if the update suceeds
  
  useOptiomistic may also take in a second argunent of something like a reducer function, that takes in the state and actions{in this case the text is provided in place of that}, with\\ which is goes on to create the optimistic state, based on that. Which kinodf gives back simplifiedAddTodo */
  const [ optimisticTodos, simplifiedAddTodo ] = useOptimistic(todos, (state, text) => {
    return [ ...state, {
      id: Math.random().toString(36).slice(2),
      text
    }]
  })

  async function addNewTodo(formData){

    const newTodo = formData.get("text");
    /* This is the function based approach, by providing it the current  state(the updated state canalso be provided here), to Set the Optimistic Todos with the current Todos, and create a new Todo with a random ID and the Todos with te new Todo

    This simplifiedAddTodo will be the wrapper around the reducer fn() provided to the useOptimistic(), taht takes in teh state and the action to create the new state based on that. */
    simplifiedAddTodo(newTodo);

    try {
      await addTodo(newTodo);
      setTodos(await getTodos());
    } catch (error) {
      // Could even add a toast message
      console.log(error);
    } finally{
      // the form data post submission, using the formRef
      formRef.current.reset();
    }
  }
  
  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {optimisticTodos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
      <form ref={formRef} action={addNewTodo}>
        <input 
          type="text" 
          name="text" 
        />
      </form>
    </>
  )
}

export default App
