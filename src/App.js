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

function Sub4({ appNo }) {
  const [no, setNo] = useState(0);
  if (appNo % 2 != 0) {
    return null;
  }
  return (
    <>
      <button onClick={() => setNo(no + 4)}>Sub4 : {no}</button>
    </>
  );
}

function Sub3({ appNo }) {
  const [no, setNo] = useState(0);
  if (appNo % 2 == 0) {
    return null;
  }
  return (
    <>
      <button onClick={() => setNo(no + 3)}>Sub3 : {no}</button>
    </>
  );
}

function App() {
  const [no, setNo] = useState(0);

  return (
    <>
      <button onClick={() => setNo(no + 1)}>+1 : {no} </button>
      <div>
        <Sub3 appNo={no} />
        <Sub4 appNo={no} />
      </div>
    </>
  );
}

export default App;
