import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect, memo, useCallback, useMemo } from "react";

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

const Todos = memo(({ todos }) => {
  const renderTodo = (todo, i) => {
    console.log("todo: " + i);
    return <div key={i.toString()}>{todo}</div>;
  };

  return <div>{todos.map(renderTodo)}</div>;
});

const expensiveFunc = (text) => {
  // await new Promise((r) => setTimeout(r, 2000));

  console.log("expensiveFunc called");
  Math.pow(1000, 1000);
  return "Calculated: " + text;
};

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [todoValue, setTodoValue] = useState("");

  useEffect(() => {
    let _items = [];
    for (let i = 0; i < 1000; i++) {
      _items.push(i);
    }

    setTodos(_items);
  }, []);

  const valueX = useMemo(() => expensiveFunc(todos.length), [todos]);

  console.log({ valueX });

  // const addToDo = (todo) => setTodos([todo, ...todos]);
  const addToDo = useCallback((todo) => setTodos([todo, ...todos]), []);

  return (
    <div>
      <div>
        <input
          type="text"
          value={todoValue}
          onChange={(e) => setTodoValue(e.target.value)}
          placeholder="Todo eingeben"
        />
        <button
          onClick={() => {
            addToDo(todoValue);
            setTodoValue("");
          }}
        >
          Add
        </button>
      </div>

      {/* <Todos todos={todos} addToDo={addToDo} /> */}
    </div>
  );
};

export default App;
