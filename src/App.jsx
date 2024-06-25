import { useEffect, useState } from 'react'
import './App.css'

async function getTodos(){
  const res = await fetch("http://localhost:8080/api/todos")
  return await res.json();
}

async function addTodos(text){
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

  useEffect(() => {
    getTodos().then(setTodos);
  }, [])

  todos && console.log("Todos:\t", todos);

  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {todos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
    </>
  )
}

export default App
