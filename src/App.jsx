import { useOptimistic, useActionState, useRef } from 'react'
import './App.css'
import { useMutation, useQuery } from '@tanstack/react-query';

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

  // While installing React Query on a React 19 app, it may throw an unmet peer of react@19 error, saying React Query is not compatible with React 19. But attually it is fine, this error is due to the fact that the peer dependency in React Query has not been updated yet for React 19, but React Query will work with whatever version of React that is offered, 18 or 19.

  // React Query on the other hand, has this Optimistic Updates configured within itself as sort of a pattern, but not actually build into React Query, with the useOptimistic hook, that feature can directly be implemented.

  // refetch is added to refetch the data once a new Todo has been added
  const { data: todos, refetch } = useQuery({
    queryKey:["todos"],
    queryFn: getTodos,
    initialData: []
  });
  
  
  /* Invoke useOptimistic() and provide the todos, which will give optimistic Todos => It will share the updated state, to say this is what the to-dos will look like if the update suceeds
  
  useOptiomistic may also take in a second argunent of something like a reducer function, that takes in the state and actions{in this case the text is provided in place of that}, with\\ which is goes on to create the optimistic state, based on that. Which kinodf gives back simplifiedAddTodo */
  const [ optimisticTodos, simplifiedAddTodo ] = useOptimistic(todos, (state, text) => {
    return [ ...state, {
      id: Math.random().toString(36).slice(2),
      text
    }]
  })

  // ref to reset the form data post submission
  const formRef = useRef();

  // Get the async version of the mutate fn(), as it will return a promise that can be awaited
  const { mutateAsync: addTodoMutation } = useMutation({
    mutationFn: addTodo,
    onMutate: simplifiedAddTodo,
    onSuccess: refetch
  });

  async function addNewTodo(){
    /* 
      formData can be null when passed inot addNewTodo(), so use the formRef to instatiate FormDate on that ref, to generate form data using the FormData Object.

      - - - *FormData object is a common way to create a bundle of data to send to the server using XMLHttpRequest or fetch. It replicates the functionality of the HTML form element. We can think of it as an array of arrays. There is one array for each element that we want to send to the server.* - - - 
    */
    const formData = new FormData(formRef.current);
    const newTodo = formData.get("text");

    try {
      await addTodoMutation(newTodo);
      // refetch(); => not required as a refetch has already been configured for onSuccess in the Mutation Query
    } catch (error) {
      // Could even add a toast message
      console.log(error);
    } finally{
      // the form data post submission, using the formRef
      formRef.current.reset();
    }
  }

  // useActionState is a Hook that allows you to update state based on the result of a form action.
  // addNewTodoWithState => output of the fn()
  const [ actionState, addNewTodoWithState, isPending ] = useActionState(addNewTodo);
  
  return (
    <>
      <h1 className="">Todos</h1>
      <br />
      <ul>
        {optimisticTodos.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
      <form ref={formRef} action={addNewTodoWithState}>
        <input 
          type="text" 
          name="text" 
          disabled={isPending}
        />
      </form>
    </>
  )
}

export default App
