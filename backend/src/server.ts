import express, { Application, Request, Response } from 'express';

const app: Application = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on PORT:${port}`);
});
