import "./index.css";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  TextField,
  Button,
  Chip,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  Modal,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue,
  atomFamily,
} from "recoil";

const muiThemePaletteKeys = [
  "background",
  "common",
  "error",
  "grey",
  "info",
  "primary",
  "secondary",
  "success",
  "text",
  "warning",
];

function NewTodoForm({ todosState, noticeSnackbarState }) {
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("Enter Todo");
      form.content.focus();
      return;
    }

    const newTodoId = todosState.addTodo(form.content.value);
    form.content.value = "";
    form.content.focus();
    noticeSnackbarState.openBar(`No : ${newTodoId} Add New Todo `);
  };

  return (
    <>
      <form className="flex flex-col mt-5 px-4 gap-2" onSubmit={onSubmit}>
        <TextField
          label="Multiline"
          multiline
          minRows={3}
          name="content"
          defaultValue=""
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
        <Button type="reset" variant="contained">
          Cancle
        </Button>
      </form>
    </>
  );
}

function TodoListItem({ todosState, todo, index, openDrawer }) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const editContentInputRef = useRef(null);

  const removeTodo = () => {
    todosState.removeTodo(index);
  };

  const showEdit = () => {
    setEditMode(true);
  };

  const cancleEdit = () => {
    setEditMode(false);
    setEditContent(todo.content);
  };

  const commitEdit = () => {
    if (editContent.trim().length == 0) {
      alert("Enter Content");
      editContentInputRef.current.focus();
      return;
    }
    setEditMode(false);
    todosState.updateTodo(index, editContent.trim());
  };

  const [checkBox, setCheckBox] = useState(false);

  return (
    <li>
      <Chip
        className="!pt-1"
        label={`No : ${todo.id}`}
        size="small"
        color="secondary"
        variant="outlined"
      />{" "}
      &nbsp;
      <Chip
        className="!pt-1"
        label={`Time: ${todo.regDate}`}
        variant="outlined"
      />{" "}
      <br />
      {editMode || (
        <>
          <div className="flex mt-4 mb-4 shadow rounded-[20px]">
            <Button
              onClick={() => setCheckBox(!checkBox)}
              className="flex-shrink-0 self-start !rounded-l-[20px]"
              color="inherit"
            >
              <span
                className={
                  (checkBox
                    ? "text-[color:var(--mui-color-primary-main)]"
                    : "text-[#dcdcdc]") + " text-4xl h-[80px]"
                }
              >
                <i className="fa-solid fa-check"></i>
              </span>
            </Button>
            <div className="w-[2px] bg-[#dcdcdc] mr-4 my-3"></div>
            <div className="flex-grow flex my-3 items-center whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)]">
              {todo.content}{" "}
            </div>
            <Button
              onClick={() => openDrawer(todo.id)}
              className="flex-shrink-0 !pt-2 self-start !rounded-r-[20px]"
            >
              <span className="text-[#dcdcdc] text-2xl h-[80px]">
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </span>
            </Button>
          </div>
          <button onClick={showEdit}>Update</button>
        </>
      )}
      {editMode && (
        <>
          <TextField
            ref={editContentInputRef}
            label="Update Todo"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
          />{" "}
          &nbsp;
          <button onClick={commitEdit}>Update</button> &nbsp;
          <button onClick={cancleEdit}>Cancle</button> &nbsp;
        </>
      )}
      &nbsp;
      <button onClick={removeTodo}>Delete</button>
    </li>
  );
}

function useTodoOptionDrawerState() {
  const [todoId, setTodoId] = useState(null);
  const open = useMemo(() => todoId !== null, [todoId]);
  const close = () => setTodoId(null);
  const openDrawer = (id) => setTodoId(id);

  return {
    todoId,
    open,
    close,
    openDrawer,
  };
}

function useEditModalTodoState() {
  const [open, setOpen] = useState(false);

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return {
    open,
    openModal,
    closeModal,
  };
}

function EditTodoModal({
  todosState,
  state,
  todo,
  closeDrawer,
  noticeSnackbarState,
}) {
  const close = () => {
    state.closeModal();
    closeDrawer();
  };
  const onSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("Enter Todo");
      form.content.focus();
      return;
    }

    todosState.updateTodoById(todo.id, form.content.value);
    close();
    noticeSnackbarState.openBar(`Update No : ${todo.id}`, "info");
  };

  return (
    <>
      <Modal
        open={state.open}
        onClose={close}
        className="flex items-center justify-center"
      >
        <div className="bg-white p-5 rounded-[20px] w-full max-w-xl">
          <form className="flex flex-col gap-2" onSubmit={onSubmit}>
            <TextField
              label="Multiline"
              multiline
              minRows={3}
              name="content"
              defaultValue={todo?.content}
            />
            <Button type="submit" variant="contained">
              update
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}

function TodoOptionDrawer({ todosState, state, noticeSnackbarState }) {
  const removeTodo = () => {
    if (window.confirm(`No : ${state.todoId} Delete it?`) == false) {
      state.close();
      return;
    }
    todosState.removeTodoById(state.todoId);
    state.close();
    noticeSnackbarState.openBar(`Delete Todo No : ${state.todoId}`, "info");
  };

  const editModalTodoState = useEditModalTodoState();

  const todo = todosState.findTodoById(state.todoId);

  return (
    <>
      <EditTodoModal
        state={editModalTodoState}
        todosState={todosState}
        todo={todo}
        closeDrawer={state.close}
        noticeSnackbarState={noticeSnackbarState}
      />
      <SwipeableDrawer
        anchor={"bottom"}
        onOpen={() => {}}
        open={state.open}
        onClose={state.close}
      >
        <List className="!py-0">
          <ListItem className="!pt-6 !p-5">
            No : {todo?.id} Option Drawer
          </ListItem>
          <Divider />
          <ListItem
            className="!pt-6 !p-5 !items-baseline"
            button
            onClick={editModalTodoState.openModal}
          >
            <i className="fa-solid fa-pen-to-square"></i>&nbsp;Update
          </ListItem>
          <ListItem
            className="!pt-6 !p-5 !items-baseline"
            button
            onClick={removeTodo}
          >
            <i className="fa-solid fa-trash-can"></i>&nbsp;Delete
          </ListItem>
        </List>
      </SwipeableDrawer>
    </>
  );
}

function TodoList({ todosState, noticeSnackbarState }) {
  const todoOptionDrawerState = useTodoOptionDrawerState();

  return (
    <>
      <TodoOptionDrawer
        todosState={todosState}
        state={todoOptionDrawerState}
        noticeSnackbarState={noticeSnackbarState}
      />
      <div>
        <ul className="mt-4 px-4">
          {todosState.todos.map((el, index) => (
            <TodoListItem
              key={el.id}
              todosState={todosState}
              todo={el}
              index={index}
              openDrawer={todoOptionDrawerState.openDrawer}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function TodoApp({ todosState, noticeSnackbarState }) {
  return (
    <>
      <NewTodoForm
        todosState={todosState}
        noticeSnackbarState={noticeSnackbarState}
      />

      <hr />
      {/* todos: {JSON.stringify(todos)} */}
      <TodoList
        todosState={todosState}
        noticeSnackbarState={noticeSnackbarState}
      />
    </>
  );
}

function useTodosState() {
  const [todos, setTodos] = useState([]);
  const todoId = useRef(0);

  const addTodo = (newContent) => {
    const id = ++todoId.current;
    const newTodo = {
      id: id,
      content: newContent,
      regDate: dateToStr(new Date()),
    };
    // const newTodos = [...todos, newTodo];
    // setTodos(newTodos);

    setTodos((todos) => [...todos, newTodo]);
    return id;
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const removeTodoById = (id) => {
    const index = findTodoIndexById(id);
    removeTodo(index);
  };

  const updateTodo = (index, newContent) => {
    const newTodos = todos.map((_, _index) =>
      _index != index ? _ : { ..._, content: newContent }
    );
    setTodos(newTodos);
  };

  const updateTodoById = (id, newContent) => {
    const index = findTodoIndexById(id);
    updateTodo(index, newContent);
  };

  const findTodoIndexById = (id) => {
    return todos.findIndex((todo) => todo.id == id);
  };

  const findTodoById = (id) => {
    const index = findTodoIndexById(id);
    return todos[index];
  };

  return {
    todos,
    addTodo,
    removeTodo,
    updateTodo,
    removeTodoById,
    findTodoById,
    updateTodoById,
  };
}

function dateToStr(date) {
  //   Sat May 13 2023 19:57:36
  //   2023-05-13 19:57:36
  const pad = (n) => {
    return n < 10 ? "0" + n : n;
  };
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

function NoticeSnackbar({ state }) {
  return (
    <>
      <Snackbar
        open={state.open}
        autoHideDuration={state.autoHideDuration}
        onClose={state.closeBar}
      >
        <Alert severity={state.severity}>{state.msg}</Alert>
      </Snackbar>
    </>
  );
}

function useNoticeSnackbarState() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [autoHideDuration, setAutoHideDuration] = useState(null);

  const openBar = (msg, severity = "success", autoHideDuration = 6000) => {
    setOpen(true);
    setMsg(msg);
    setSeverity(severity);
    setAutoHideDuration(autoHideDuration);
  };

  const closeBar = () => {
    setOpen(false);
  };

  return {
    open,
    openBar,
    closeBar,
    msg,
    severity,
    autoHideDuration,
  };
}

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert {...props} ref={ref} variant="filled" />;
});

function App() {
  const todosState = useTodosState();
  const noticeSnackbarState = useNoticeSnackbarState();

  useEffect(() => {
    todosState.addTodo("Study");
    todosState.addTodo("Play");
    todosState.addTodo("PoPong");
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: ["GmarketSansMedium"],
    },
    palette: {
      primary: {
        main: "#33bbf6",
        contrastText: "#ffffff",
      },
    },
  });

  useEffect(() => {
    const r = document.querySelector(":root");
    muiThemePaletteKeys.forEach((paletteKey) => {
      const themeColorObj = theme.palette[paletteKey];
      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`--mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return (
    <>
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AppBar position="fixed">
            <Toolbar>
              <Box className="flex-1"></Box>
              <span className="font-bold">HAPPY NOTE</span>
              <Box className="flex-1"></Box>
            </Toolbar>
          </AppBar>
          <Toolbar />
          <TodoApp
            todosState={todosState}
            noticeSnackbarState={noticeSnackbarState}
          />
          <NoticeSnackbar state={noticeSnackbarState} />
        </ThemeProvider>
      </RecoilRoot>
    </>
  );
}

export default App;
