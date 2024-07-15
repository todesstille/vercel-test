import {app} from "./settings";

const port = 8000;

app.listen(port, () => {
    console.log("Server started on port:", port);
})