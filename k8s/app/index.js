const app = require("./app");

// Run server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server run on localhost:${port}`);
});
