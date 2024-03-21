import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import axios from "axios";
import "./App.css";

interface Task {
  id?: number;
  title?: string;
  notes?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

function App() {
  const [todos, setTodos] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoNotes, setNewTodoNotes] = useState<string>("");


  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    axios
      .get<Task[]>("http://localhost:5173/get")
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
    // Periksa apakah judul tugas baru tidak kosong
    if (!newTodoTitle) {
      return;
    }
  
    try {
      // Buat objek data baru untuk tugas
      const data = {
        title: newTodoTitle,
        notes: newTodoNotes,
      };
  
      // Kirim permintaan POST ke server menggunakan Axios
      const response = await axios.post('http://localhost:3000/tasks', data, {
        withCredentials: true
      });
  
      // Log respon dari server dan perbarui tugas
      console.log("New todo added successfully:", response.data);
      fetchTodos();
  
      // Bersihkan input setelah tugas ditambahkan
      setNewTodoTitle("");
      setNewTodoNotes("");
    } catch (error) {
      // Tangkap dan tampilkan pesan error jika terjadi error saat menambahkan tugas baru
      console.error("Error adding new todo:");
    }
  };

  const handleDeleteTodo = (id: number) => () => {
    axios
      .delete(`http://localhost:3000/delete/${id}`)
      .then(() => {
        setTodos((todos) => todos.filter((todo) => todo.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting todo:", error);
      });
  };

  const handleUpdateTitle = (id: number) => () => {
    setIsEditing(true);
    const updatedTitle = prompt(
      "Enter new title:",
      todos.find((todo) => todo.id === id)?.title
    );
    if (updatedTitle) {
      axios
        .put(`http://localhost:3000/put/${id}`, { title: updatedTitle })
        .then(() => {
          fetchTodos();
        })
        .catch((error) => {
          console.error("Error updating title:", error);
        });
    }
    setIsEditing(false);
  };

  const handleUpdateNotes = (id: number) => () => {
    const updatedNotes = prompt(
      "Enter new notes:",
      todos.find((todo) => todo.id === id)?.notes
    );
    if (updatedNotes) {
      axios
        .put(`http://localhost:3000/put/${id}`, { notes: updatedNotes })
        .then(() => {
          fetchTodos();
        })
        .catch((error) => {
          console.error("Error updating notes:", error);
        });
    }
  };

  const handleUpdateTodo = (id: number) => () => {
    const updatedCompleted = !todos.find((todo) => todo.id === id)?.completed;
    axios
      .put(`http://localhost:3000/tasks/${id}`, { completed: updatedCompleted })
      .then(() => {
        fetchTodos(); // Ambil ulang daftar tugas setelah pembaruan
      })
      .catch((error) => {
        console.error("Error updating todo:", error);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (isEditing) {
      } else {
        handleAddTodo();
      }
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 500,
        padding: 3,
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
        <Button variant="contained" fullWidth onClick={() => handleAddTodo()}>
          Save
        </Button>

        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
  {todos.map((todo: Task) => (
    <Card key={todo.id} sx={{ my: 1 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {todo.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {todo.notes}
        </Typography>
        <Button onClick={() => todo.id !== undefined && handleDeleteTodo(todo.id)}>
          Delete
        </Button>
        <Button onClick={() =>todo.id !== undefined && handleUpdateTitle(todo.id)}>
          Edit Title
        </Button>
        <Button onClick={() => todo.id !== undefined && handleUpdateNotes(todo.id)}>
          Edit Notes
        </Button>
        <Button onClick={() => todo.id !== undefined && handleUpdateTodo(todo.id)}>
          {todo.completed ? "Mark Incomplete" : "Mark Complete"}
        </Button>
      </CardContent>
    </Card>
  ))}
</List>

      </CardContent>
    </Card>
  );
}

export default App;
