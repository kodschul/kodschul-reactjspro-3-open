import { useState, useEffect, memo, useCallback, useMemo } from "react";

const Todos = ({ todos }) => {
  const renderTodo = (todo, i) => {
    console.log("todo: " + i);
    return <div key={i.toString()}>{todo}</div>;
  };

  return <div>{todos.map(renderTodo)}</div>;
};

const TodoApp = () => {
  const [todos, setTodos] = useState(
    Array.from({ length: 10 }, (_, i) => "item " + i)
  );
  const [todoValue, setTodoValue] = useState("");

  const addToDo = (todo) => setTodos([todo, ...todos]);
  // const addToDo = useCallback((todo) => setTodos([todo, ...todos]), []);

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

      <Todos todos={todos} addToDo={addToDo} />
    </div>
  );
};

export default TodoApp;
