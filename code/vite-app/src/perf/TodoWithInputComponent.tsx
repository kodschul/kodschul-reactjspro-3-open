import { useEffect, useState } from "react";

const TodoInput = ({ addTodo }) => {
  const [todoText, setTodoText] = useState("");

  const clearInput = () => {
    setTodoText("");
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter To-do"
        style={styles.input}
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
      />
      <p>You are typing: {todoText} </p>
      <button onClick={clearInput}>Clear input</button>
      <button
        onClick={() => {
          addTodo(todoText);
          clearInput();
        }}
      >
        Add
      </button>
    </>
  );
};

const TodoApp = () => {
  const [todos, setTodos] = useState<string[]>(["Code", "Read"]);
  // logic

  //   const updateTodoText

  useEffect(() => {
    let _largeList = [];

    for (let i = 0; i < 10000; i++) {
      _largeList.push(`Item ${i}`);
    }

    setTodos(_largeList);
  }, []);

  const addTodo = (todoText: string) => {
    if (todoText == "") {
      return;
    }

    setTodos([todoText, ...todos]);
  };

  const deleteTodo = (todo) => {
    let newTodos = todos.filter((x) => x != todo);

    setTodos(newTodos);
  };

  return (
    <div style={styles.main}>
      <div>
        <h1>FormApp</h1>

        <TodoInput addTodo={addTodo} />
        <hr />
        <hr />
        <div style={{ overflowY: "scroll", maxHeight: 500 }}>
          {todos.map((todo) => (
            <TodoItem key={todo} todo={todo} deleteTodo={deleteTodo} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TodoItem = ({ todo, deleteTodo }) => {
  console.log("TodoItem rendered: ", todo);

  return (
    <div style={styles.todoItem}>
      <span style={{ flex: 1 }}>{todo}</span>
      <div onClick={() => deleteTodo(todo)} style={styles.deleteItemBtn}>
        x
      </div>
    </div>
  );
};

const styles: any = {
  main: {
    height: "100vh",
    width: "100vw",
    color: "white",
    background: "rgb(0, 0, 46)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  input: {
    fontSize: 24,
    background: "transparent",
    color: "white",
  },
  todoItem: {
    minWidth: 300,
    padding: 10,
    margin: 10,
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "white",
    borderStyle: "solid",
    display: "flex",
    alignItems: "center",
  },
  deleteItemBtn: {
    cursor: "pointer",
    userSelect: "none",

    fontSize: 30,
    fontWeight: "500",
    padding: 5,
  },
};

export default TodoApp;
