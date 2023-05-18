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

import { RecoilRoot, atom, useRecoilState } from "recoil";
import { recoilPersist } from "recoil-persist";

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

function NewTodoForm() {
  const todosState = useTodosState();
  const noticeSnackbarState = useNoticeSnackbarState();

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
          label="Todo"
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

function TodoListItem({ todo, openDrawer }) {
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

function EditTodoModal({ state, todo, closeDrawer }) {
  const todosState = useTodosState();
  const noticeSnackbarState = useNoticeSnackbarState();

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

function TodoOptionDrawer({ state }) {
  const todosState = useTodosState();
  const noticeSnackbarState = useNoticeSnackbarState();

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
        todo={todo}
        closeDrawer={state.close}
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

function TodoList() {
  const todosState = useTodosState();
  const todoOptionDrawerState = useTodoOptionDrawerState();

  return (
    <>
      <TodoOptionDrawer state={todoOptionDrawerState} />
      <div>
        <ul className="mt-4 px-4">
          {todosState.todos.map((el, index) => (
            <TodoListItem
              key={el.id}
              todo={el}
              openDrawer={todoOptionDrawerState.openDrawer}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function TodoApp() {
  return (
    <>
      <NewTodoForm />

      <hr />
      {/* todos: {JSON.stringify(todos)} */}
      <TodoList />
    </>
  );
}

const { persistAtom: persistAtomTodos } = recoilPersist({
  key: "persistAtomTodos",
});
const { persistAtom: persistAtomLastTodoId } = recoilPersist({
  key: "persistAtomLastTodoId",
});

const todosAtom = atom({
  key: "app/todosAtom",
  default: [
    {
      id: 3,
      regDate: "2023-02-25 18:13:14",
      content: "PoPong",
    },
    {
      id: 2,
      regDate: "2023-02-24 15:11:34",
      content: "Traio",
    },
    {
      id: 1,
      regDate: "2023-02-23 12:12:34",
      content: "Zkind",
    },
  ],
  effects_UNSTABLE: [persistAtomTodos],
});

const lastTodoIdAtom = atom({
  key: "app/lastTodoIdAtom",
  default: 3,
  effects_UNSTABLE: [persistAtomLastTodoId],
});

function useTodosState() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const todoId = useRef(lastTodoId);
  todoId.current = lastTodoId;

  const addTodo = (newContent) => {
    const id = ++todoId.current;
    setLastTodoId(id);
    const newTodo = {
      id: id,
      content: newContent,
      regDate: dateToStr(new Date()),
    };
    // const newTodos = [...todos, newTodo];
    // setTodos(newTodos);

    setTodos((todos) => [newTodo, ...todos]);
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

function NoticeSnackbar() {
  const state = useNoticeSnackbarState();
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

const noticeSnackbarInfoAtom = atom({
  key: "app/noticeSnackbarInfoAtom",
  default: {
    open: false,
    msg: "",
    severity: "",
    autoHideDuration: 0,
  },
});

function useNoticeSnackbarState() {
  const [noticeSnackbarInfo, setNoticeSnackbarInfo] = useRecoilState(
    noticeSnackbarInfoAtom
  );

  const { open, msg, severity, autoHideDuration } = noticeSnackbarInfo;

  const openBar = (msg, severity = "success", autoHideDuration = 6000) => {
    setNoticeSnackbarInfo({ open: true, msg, severity, autoHideDuration });
  };

  const closeBar = () => {
    setNoticeSnackbarInfo({ ...noticeSnackbarInfo, open: false });
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

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Box className="flex-1"></Box>
          <span className="font-bold">HAPPY NOTE</span>
          <Box className="flex-1"></Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <TodoApp />
      <NoticeSnackbar />
    </>
  );
}

function Root() {
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
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </RecoilRoot>
  );
}

export default Root;
