import express from 'express';
import cors from 'cors';

const PORT = 8080;

const todos = [
    { id: 1, text: "Learn React 19" },
    { id: 21, text: "Learn Vite" }
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/todos', (req,res)=>{
    res.json(todos)
})

app.post('/api/todos', (req,res)=>{

    // A timeout to emulate a delay
    setTimeout(() => {
        // Extract the request body
        const body = req.body || {};

        // Just in case come optimistic request don't succeed
        if(body.text !== "error"){
            // Create a new Todo with an id and the text from the body
            const todo = {
                id: todos.length + 1,
                text: body.text ?? ""
            };
    
            // Push the Todo into the in-memory list of todos
            todos.push(todo);
    
            // return the Todo
            res.json(todos);
        } else{
            res.status(400).json({ error: 'Failed to add Todo' });
        }
    }, 3000);
});


app.listen(PORT,() => {
    console.log(`Seerver is listening at: ${PORT}`);
});