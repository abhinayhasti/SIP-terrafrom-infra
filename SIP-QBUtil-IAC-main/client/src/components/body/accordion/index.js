import * as React from "react";

import {
  Accordion,
  AccordionSummary,
  Typography,
  Grid,
  Box,
  Button,
  Snackbar,
} from "@mui/material";


import ConnectSvg from "../../svgs/ConnectSvg";

import axios from "axios";

import { getSession } from "../../../utils/clientSession";

import MuiAlert from "@mui/material/Alert";

import { sanitizeUrl } from "@braintree/sanitize-url";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const { REACT_APP_TOKEN, REACT_APP_SERVER_URL } = process.env;

export default function SimpleAccordion() {
  const [isConnecting, setIsConnecting] = React.useState(false);

  const [openSnack, setOpenSnack] = React.useState(false);
  const [severity, setSeverity] = React.useState(null);

  const [msg, setMsg] = React.useState(null);

  const handleSubmit = (e) => {
    setIsConnecting(true);

    axios({
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
      method: "GET",
      url: `${REACT_APP_SERVER_URL}/authorize`,
    })
      .then((res) => {
        const authUrl = res.data.data;

        if (sanitizeUrl(authUrl) && sanitizeUrl(authUrl) !== "about:blank") {
          window.open(sanitizeUrl(authUrl), "_self");
        }
      })
      .catch((err) => {
        setIsConnecting(false);
        setSeverity("error");
        setMsg("Couldn't initialize connect. Try Again");
        setOpenSnack(true);
      });
  };

  return (
    <>
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

      <Box sx={{ my: 4, mx: 2 }}>
        <Accordion className="" sx={{ boxShadow: 0 }} expanded={false}>
          <AccordionSummary
            expandIcon={null}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Grid
              container
              direction={"row"}
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6">API Connection</Typography>
              </Box>

              <Box mr={20} id="connect-btn">
                <Button
                  variant="deep-blue"
                  color="white"
                  endIcon={
                    !!getSession(REACT_APP_TOKEN) ? <ConnectSvg /> : null
                  }
                  onClick={handleSubmit}
                  disabled={isConnecting ? true : false}
                >
                  {isConnecting
                    ? "Connecting..."
                    : !!getSession(REACT_APP_TOKEN)
                    ? "connected"
                    : "connect"}
                </Button>
              </Box>
            </Grid>
          </AccordionSummary>
        </Accordion>
      </Box>
    </>
  );
}
