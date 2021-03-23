const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
  })
  // eslint-disable-next-line no-console
  .then(() => console.log("Database Connected Successfully!"))
  // eslint-disable-next-line no-console
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
const { logger } = require("./libs/logger");
const indexRouter = require("./routes/index");
const { handleError, ErrorHandler } = require("./libs/error");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);

app.use("/", indexRouter);

app.use((req, res, next) => {
  const error = new ErrorHandler(404, "Not Found");
  next(error);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(port, () => {
  console.log(`server is listening on port${port}`);
});
