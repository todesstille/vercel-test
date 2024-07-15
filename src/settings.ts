import express from "express";
export const app = express();

app.get("/cources/", (request, responce) => {
    responce.json([
        {id: 1,
        name: "frontend"},
        {id: 2,
        name: "backend"}
    ]);
});

app.get("/cources/:id", (request, responce) => {
    responce.json([
        {id: 1,
        name: "frontend"},
        {id: 2,
        name: "backend"}
    ].find(c => c.id === +request.params.id));
});

app.post("/", (request, responce) => {
    responce.send("Received post command!");
})

app.get("/", (request, responce) => {
    responce.send("Received get command!");
})