import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Typography,
  TextField,
  Box,
  Button,
  Grid,
} from "@mui/material";


import { getSession, clearSession } from "../../../utils/clientSession";

import MuiAlert from "@mui/material/Alert";
import { useParser } from "../../../hooks/useParser";
import { downloader } from "./../../../utils/downloader";
import { columnWidth } from "../../../utils/columnWidth";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const { REACT_APP_TOKEN } = process.env;

const Final = () => {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  const handleError = React.useCallback((err) => {
    err &&
      handleSnack({
        type: "error",
        msg: err,
        status: true,
      });
  }, []);

  const { isLoading, fetchData, data, isError } = useParser({
    startDate,
    endDate,
    handleError,
  });

  console.log({ data });
  const [openSnack, setOpenSnack] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const handleSnack = ({ type, msg, status }) => {
    setSeverity(type);
    setMsg(msg);
    setOpenSnack(status);
  };

  const handleFetchData = () => {
    fetchData();
  };

  const handleDownload = () => {
    downloader(data, "new data.xlsx");
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

      <Box sx={{ p: 2 }}>
        <Grid
          sx={{ my: 5 }}
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <TextField
                  id="date"
                  label="Start Date"
                  type="date"
                  defaultValue={startDate}
                  sx={{ width: 220 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                />
              </Box>

              <Box mx={2}>
                <TextField
                  id="date"
                  label="End Date"
                  type="date"
                  defaultValue={endDate}
                  sx={{ width: 220 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                  }}
                />
              </Box>

              <Box>
                <Button
                  onClick={handleFetchData}
                  disabled={isLoading || !endDate || !startDate}
                  variant="deep-blue"
                  color="white"
                  sx={{ px: 3, py: 1 }}
                >
                  {isLoading ? "Get Data ..." : "Get Data"}
                </Button>
              </Box>
            </Grid>
          </Box>

          <Box>
            <Button
              onClick={handleDownload}
              disabled={!data?.length}
              variant="deep-blue"
              color="white"
              sx={{ px: 3, py: 1 }}
            >
              Download
            </Button>
          </Box>
        </Grid>

        {!isLoading && !isError && (
          <TableContainer component={Paper} elevation={6}>
            <Table sx={{ minWidth: 650 }} aria-label="profit and loss table">
              <TableHead>
                <TableRow>
                  {Object.keys(data?.[0] || [])?.map((d, i) => (
                    <TableCell
                      key={d}
                      sx={{
                        minWidth: columnWidth(d),
                      }}
                    >
                      {d}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((d, i) => (
                  <TableRow key={i} sx={{ td: { border: 0 } }}>
                    {Object.keys(data?.[0] || [])?.map((prop, iD) => (
                      <TableCell key={iD}>{d[prop] ? d[prop] : 0}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {isLoading && (
          <Paper
            elevation={2}
            sx={{
              backgroundColor: "white",
              textAlign: "center",
              height: "17em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1">Please Wait...</Typography>
          </Paper>
        )}

        {!!!(data || []).length && !isLoading && (
          <Paper
            elevation={2}
            sx={{
              backgroundColor: "white",
              textAlign: "center",
              height: "17em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1">Empty Table</Typography>
          </Paper>
        )}

        <Grid
          mt={5}
          container
          direction="row"
          justifyContent="end"
          alignItems="center"
        >
          {/*<Box>
            {!isLoading && data?.length > 0 && (
              <>
                <Grid container flexDirection="row" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="fadeBlack">
                      Total Transactions:
                    </Typography>
                  </Box>
                  <Box ml={4}>
                    <Typography variant="h5">{data?.length}</Typography>
                  </Box>
                </Grid>

                <Grid container flexDirection="row" alignItems="center" my={3}>
                  <Box>
                    <Typography variant="h6" color="fadeBlack">
                      Transaction Period:
                    </Typography>
                  </Box>
                  <Box ml={4}>
                    <Typography variant="h5">
                      {Object.keys(data?.[0]).slice(5, 6)} -{" "}
                      {Object.keys(data?.[0]).slice(-1)}
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Box>*/}

          {Boolean(getSession(REACT_APP_TOKEN)) && (
            <Box>
              <Button
                variant="light-blue"
                color="white"
                onClick={() => {
                  clearSession();
                }}
                disabled={!Boolean(getSession(REACT_APP_TOKEN))}
              >
                RESET
              </Button>
            </Box>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default Final;
