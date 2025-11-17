import { createTheme } from "@mui/material/styles";

import { deepmerge } from "@mui/utils";

const styles = {
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "deep-blue" },
          style: {
            textTransform: "text-capitalize",
            background: "#004A87",
            color: "#ffffff",
            "&:hover": {
              opacity: 0.6,
              background: "#005A87",
            },
            "&:disabled": {
              opacity: 0.1,
              color: "#ffffff",
            },
          },
        },

        {
          props: { variant: "deep-green" },
          style: {
            textTransform: "text-capitalize",
            background: "#107C41",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#10ac41",
            },
            "&:disabled": {
              opacity: 0.1,
              color: "#ffffff",
            },
          },
        },
        {
          props: { variant: "light-blue" },
          style: {
            textTransform: "text-capitalize",
            background: "#7fa43c",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#7f943c",
            },
            "&:disabled": {
              opacity: 0.1,
              color: "#ffffff",
            },
          },
        },
        {
          props: { variant: "btn-menu" },
          style: {
            textTransform: "text-capitalize",
            background: "rgba(251, 242, 255, 0.2)",
            border: "1px solid #7F5297",
            color: "rgba(53, 53, 53, 1)",
            //"&:hover": {
            //  backgroundColor: "#7f943c",
            //},
            "&:disabled": {
              opacity: 0.1,
            },
            "&:active": {
              background: "rgba(53, 53, 53, 0.1)",
              border: 0,

            }
          },
        },
      ],
    },
  },
};

const colors = {
  palette: {
    fadeBlack: "rgba(33, 35, 34, 0.45)",
    deepGreen: "#107C41",
    white: "#ffffff",
    lightBlue: "#7fa43c",
  },
};

export const theme = createTheme(deepmerge(styles, colors));
