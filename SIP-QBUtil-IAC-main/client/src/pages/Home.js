import React from "react";

import ApiAccordion from "../components/body/accordion";
import Header from "./../components/header/index";

import styles from "./index.module.css";
import Final from "./../components/body/excel-logic/index";

import { useSearchParams } from "react-router-dom";

import axios from "axios";

import { removeSession, saveSession } from "../utils/clientSession";

import Snackbar from "@mui/material/Snackbar";

import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const { REACT_APP_TOKEN, REACT_APP_SERVER_URL, REACT_APP_CLIENT_URL } =
  process.env;

const Home = () => {
  const [queryParam] = useSearchParams();

  const [openSnack, setOpenSnack] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const query = queryParam.get("token");
  const state = queryParam.get("state");

  React.useEffect(() => {
    if (query === "true" && state) {
      const getToken = async () => {
        try {
          const res = await axios({
            method: "GET",
            url: `${REACT_APP_SERVER_URL}/retrieve-token?state=${state}`,
          });

          window.location.href = REACT_APP_CLIENT_URL;

          saveSession(REACT_APP_TOKEN, JSON.stringify(res.data.data));
          setSeverity("success");
          setMsg("Authenticated successfully");
          setOpenSnack(true);
        } catch (e) {
          removeSession(REACT_APP_TOKEN);

          window.location.href = REACT_APP_CLIENT_URL;

          setSeverity("error");
          setMsg("Couldn't Authenticate. Try Again.");
          setOpenSnack(true);
        }
      };

      getToken();
    }
    if (query === "false") {
      removeSession(REACT_APP_TOKEN);

      window.location.href = REACT_APP_CLIENT_URL;

      setSeverity("error");
      setMsg("Couldn't Authenticate. Try Again.");
      setOpenSnack(true);
    }
  }, [query, state]);

  return (
    <div className={`${styles.wrapper} h-100`}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={openSnack}
        onClose={() => setOpenSnack(false)}
        key={"top right"}
      >
        <Alert
          onClose={() => setOpenSnack(false)}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {msg}
        </Alert>
      </Snackbar>
      <Header />
      <ApiAccordion />
      <Final />
    </div>
  );
};

export default Home;
