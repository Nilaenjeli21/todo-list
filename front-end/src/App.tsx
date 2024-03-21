import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import axios from "axios";
import "./App.css";

interface List {
  id: number;
  title: string;
  notes?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

function App() {
  const [todos, setTodos] = useState<List[]>([]);
  const [state, setState] = useState<boolean>(false);
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoNotes, setNewTodoNotes] = useState<string>("");
  const [clickedId, setClickId] = useState<number>(0);
  console.log(newTodoTitle);

  const axiosConfig = {
    withCredentials: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    axios
      .get<List[]>("http://localhost:3000/lists", axiosConfig)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTodos(response.data);
        } else {
          console.error("Error fetching data: Invalid response format");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle) {
      return;
    }

    try {
      const data = {
        title: newTodoTitle,
        notes: newTodoNotes,
      };

      const response = await axios.post(
        "http://localhost:3000/lists",
        data,
        axiosConfig
      );

      console.log("New todo added successfully:", response.data);

      // Menambahkan tugas baru ke daftar yang sudah ada
      setTodos([...todos, response.data]);

      setNewTodoTitle("");
      setNewTodoNotes("");
    } catch (error) {
      console.error("Error adding new todo:", error);
    }
  };

  const handleDeleteTodo = (id: number) => () => {
    console.log(id);
    axios
      .delete(`http://localhost:3000/lists/${id}`)
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting todo:", error);
      });
  };

  const handleUpdateTitle = (id: number) => () => {
    setState(!state);
    if (!newTodoTitle) {
      setNewTodoTitle(todos.find((todo) => todo.id === id)?.title || "");
      setClickId(id);
      return;
    }
    if (id !== clickedId) {
      setNewTodoTitle("");
      setState(!state);
      return;
    }
    axios
      .put(`http://localhost:3000/lists/${id}`, { title: newTodoTitle })
      .then(() => {
        fetchTodos();
        const updatedTodos = todos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, title: newTodoTitle };
          } else {
            return todo;
          }
        });
        setTodos(updatedTodos);
        setNewTodoTitle("");
        setState(!state);
      })
      .catch((error) => {
        console.error("Error updating title:", error);
      });
  };

  const handleUpdateNotes = (id: number) => () => {
    setState(!state);
    if (!newTodoNotes) {
      setNewTodoNotes(todos.find((todo) => todo.id === id)?.notes || "");
      setClickId(id);
      return;
    }
    if (id !== clickedId) {
      setNewTodoNotes("");
      setState(!state);
      return;
    }
    axios
      .put(`http://localhost:3000/lists/${id}`, { notes: newTodoNotes })
      .then(() => {
        const updatedTodos = todos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, notes: newTodoNotes };
          } else {
            return todo;
          }
        });
        setTodos(updatedTodos);
        setNewTodoNotes("");
        setState(!state);
      })
      .catch((error) => {
        console.error("Error updating notes:", error);
      });
  };

  const handleUpdateTodo = (id: number) => () => {
    axios
      .put(`http://localhost:3000/lists/${id}`)
      .then(() => {
        fetchTodos();
      })
      .catch((error) => {
        console.error("Error updating todo:", error);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (state) {
      } else {
        handleAddTodo();
      }
    }
  };

  return (
    <div>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 500,
          padding: 3,
          margin: "auto",
          marginTop: 50,
        }}
      >
        <CardContent>
          <Typography sx={{ fontSize: 42 }} color="text.secondary">
            Todo List
          </Typography>
          <TextField
            id="outlined-helperText"
            sx={{ mb: 2 }}
            label="Title"
            fullWidth
            value={newTodoTitle}
            onKeyDown={handleKeyDown}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <TextField
            id="outlined-helperText"
            sx={{ mb: 2 }}
            label="Notes"
            fullWidth
            value={newTodoNotes}
            onKeyDown={handleKeyDown}
            onChange={(e) => setNewTodoNotes(e.target.value)}
          />
          <Button variant="contained" fullWidth onClick={handleAddTodo}>
            Add
          </Button>

          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {todos.map((todo: List) => (
              <Card key={todo.id} sx={{ my: 1 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {todo.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todo.notes}
                  </Typography>
                  <Button onClick={handleDeleteTodo(todo.id)}>Delete</Button>

                  <Button
                    onClick={handleUpdateTodo(todo.id)}
                    sx={{
                      bgcolor: todo.completed ? "green" : "inherit",
                      color: todo.completed ? "#fff" : "#000",
                    }}
                  >
                    {todo.completed ? "Selesai" : "Belum"}
                  </Button>

                  <Button
                    onClick={() => {
                      setClickId(todo.id); // Perbarui clickedId sebelum memanggil handleUpdateTitle
                      handleUpdateTitle(todo.id)(); // Panggil fungsi handleUpdateTitle setelah memperbarui clickedId
                    }}
                  >
                    Update Title
                  </Button>
                  <Button
                    onClick={() => {
                      setClickId(todo.id); // Perbarui clickedId sebelum memanggil handleUpdateNotes
                      handleUpdateNotes(todo.id)(); // Panggil fungsi handleUpdateNotes setelah memperbarui clickedId
                    }}
                  >
                    Update Notes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
