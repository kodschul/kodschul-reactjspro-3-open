import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import DOMPurify from "dompurify";

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

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [itemText, setItemText] = useState("");

  const renderTodo = (todo, i) => {
    return (
      <div key={i.toString()}>
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(todo) }}
        ></div>
      </div>
    );
  };

  const addToDo = () => setTodos([...todos, itemText]);

  return (
    <div>
      <div>
        <input
          type="text"
          value={itemText}
          onChange={(e) => setItemText(e.target.value)}
          placeholder="Todo eingeben"
        />
        <button onClick={addToDo}>Add</button>
      </div>

      {todos.map(renderTodo)}
    </div>
  );
};

export default App;
