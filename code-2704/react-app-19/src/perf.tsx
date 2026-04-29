import { useState, useEffect, memo, useCallback, useMemo } from "react";

// const Todos = ({ todos }) => {
//   return <div>{todos.map(renderTodo)}</div>;
// };

const TodoApp = () => {
  const [todos, setTodos] = useState(
    Array.from({ length: 100 }, (_, i) => "item " + i)
  );
  const [todoValue, setTodoValue] = useState("");

  const addToDo = (todo) => setTodos([todo, ...todos]);
  // const addToDo = useCallback((todo) => setTodos([todo, ...todos]), []);

  const renderTodo = (todo, i) => {
    console.log("todo: " + i);
    return <div key={i.toString()}>{todo}</div>;
  };

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
      <div>{todos.map(renderTodo)}</div>;
    </div>
  );
};

export default TodoApp;
