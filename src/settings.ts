import express from "express";
export const app = express();

let db: any = [];
let ids: number = 1;
const allowedResolutions = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'];

function validateInput(obj: any): any {
    const errors: any = [];
    if (typeof obj !== 'object' || obj === null) {
        errors.push({message: 'error!', field: 'title'});
        errors.push({message: 'error!', field: 'author'});
        errors.push({message: 'error!', field: 'availableResolution'});
        return errors;
    };
    if (typeof obj.title !== 'string') {
        errors.push({message: 'error!', field: 'title'});
    };
    if (typeof obj.author !== 'string') {
        errors.push({message: 'error!', field: 'author'});
    };
    if (typeof obj.availableResolutions !== 'object' || !Array.isArray(obj.availableResolutions)) {
        errors.push({message: 'error!', field: 'availableResolutions'});
    } else {
        for (let p of obj.availableResolutions) {
            if (!allowedResolutions.includes(p)) {
                errors.push({message: 'error!', field: 'availableResolutions'});
                break;
            }
        }
    }

    return errors;
}

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({version: '1.0'})
})

app.delete("/hometask_01/api/testing/all-data", (req, res) => {
    db = [];
    res.send(204);
});

app.get("/hometask_01/api/videos", (req, res) => {
    res.status(200).json(db);
});

app.post("/hometask_01/api/videos", (req, res) => {
    const body = req.body;
    const errors = validateInput(body);
    console.log(errors)
    if (errors.length > 0) {
        res.status(404).json({
            errorMessages: [errors]
        })
    } else {
        const video = {
            id: ids++,
            title: body.title,
            author: body.author,
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: new Date(),
            publicationDate: new Date(),
            availableResolutions: body.availableResolutions
        };
        db.push(video);
        res.status(400).json(video);
    }
});

app.get("/hometask_01/api/videos/:id", (req, res) => {
    for (let p of db) {
        if (p.id.toString() == req.params.id) {
            res.status(200).json(p);
            return;
        }
    }

    res.send(404);
})

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