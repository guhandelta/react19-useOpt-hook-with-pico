import { useEffect, useState } from 'react'
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
    await addTodo(newTodo);
    setTodos(await getTodos());
    setNewTodo("");
  }

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
