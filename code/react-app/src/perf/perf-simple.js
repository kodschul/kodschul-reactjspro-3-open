import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <TodoApp />
      </header>
    </div>
  );
};

const TodoItemInput = ({ addToDo }) => {
  const [value, setValue] = useState("");

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Todo eingeben"
      />
      <button
        onClick={() => {
          addToDo(value);
          setValue("");
        }}
      >
        Add
      </button>
    </div>
  );
};

const TodoApp = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let _items = [];
    for (let i = 0; i < 1000; i++) {
      _items.push(i);
    }

    setTodos(_items);
  }, []);

  const renderTodo = (todo, i) => {
    console.log("todo: " + i);
    return <div key={i.toString()}>{todo}</div>;
  };

  const addToDo = (todo) => setTodos([todo, ...todos]);

  console.log("re-render");
  return (
    <div>
      <TodoItemInput addToDo={addToDo} />
      {todos.map(renderTodo)}
    </div>
  );
};

export default App;
