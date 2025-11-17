require("dotenv").config();

const express = require("express");

const helmet = require("helmet");

const bodyParser = require("body-parser");

const cors = require("cors");

const corsFn = require("./utils/cors");

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/auth.route");
const financialRoutes = require("./routes/financial.route");
const departmentRoutes = require("./routes/department.route");
const notFoundRoute = require("./routes/not-found.route");

const app = express()
  .use(helmet())

  .use(cors(corsFn))

  .use(express.urlencoded({ extended: false }))

  .use(bodyParser.json())

  .use(financialRoutes)
  .use(authRoutes)
  .use(departmentRoutes)
  .use(notFoundRoute)

  .listen(PORT, () => console.log(`Listening on ${PORT}`));
