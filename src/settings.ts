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
    if (typeof obj.availableResolutions !== 'object' || !Array.isArray(obj.availableResolutions || obj.availableResolutions.length == 0)) {
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

function validateUpdate(obj: any): any {
    const errors = validateInput(obj);

    if (typeof obj.canBeDownloaded !== 'undefined' && typeof obj.canBeDownloaded !== 'boolean') {
        errors.push({message: 'error!', field: 'canBeDownloaded'});
    }

    if (typeof obj.minAgeRestriction !== 'undefined' && typeof obj.minAgeRestriction !== 'number') {
        errors.push({message: 'error!', field: 'minAgeRestriction'});
    } else {
        const minAge = obj.minAgeRestriction;
        if (minAge < 1 || minAge > 18) {
            errors.push({message: 'error!', field: 'minAgeRestriction'});
        }
    }

    if (typeof obj.publicationDate !== 'undefined' && typeof obj.minAgeRestriction !== 'string') {
        errors.push({message: 'error!', field: 'publicationDate'});
    }

    return errors;
}

function modifyObject(old: any, n: any) {
    old.title = n.title;
    old.author = n.author;
    old.allowedResolutions = n.allowedResolutions;

    if (typeof n.canBeDownloaded !== 'undefined') {
        old.canBeDownloaded = n.canBeDownloaded;
    } else {
        old.canBeDownloaded = false;
    }

    if (typeof n.minAgeRestriction !== 'undefined') {
        old.minAgeRestriction = n.minAgeRestriction;
    }

    if (typeof n.publicationDate !== 'undefined') {
        old.publicationDate = n.publicationDate;
    }
}

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({version: '2.0'})
})

app.delete("/testing/all-data", (req, res) => {
    db = [];
    res.send(204);
});

app.get("/videos", (req, res) => {
    res.status(200).json(db);
});

app.post("/videos", (req, res) => {
    const body = req.body;
    const errors = validateInput(body);
    if (errors.length > 0) {
        res.status(404).json({
            errorMessages: [errors]
        })
    } else {
        const currentDate = new Date();
        const video = {
            id: ids++,
            title: body.title,
            author: body.author,
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: currentDate,
            publicationDate: new Date(currentDate.getTime() + 86400000),
            availableResolutions: body.availableResolutions
        };
        db.push(video);
        res.status(201).json(video);
    }
});

app.get("/videos/:id", (req, res) => {
    for (let p of db) {
        if (p.id.toString() == req.params.id) {
            res.status(200).json(p);
            return;
        }
    }

    res.send(404);
})

app.delete("/videos/:id", (req, res) => {
    for (let i = 0; i < db.length; i++) {
        if (db[i].id.toString() == req.params.id) {
            db[i] = db[db.length - 1];
            db.pop();
            res.send(204);
            return;
        }
    }

    res.send(404);
})

app.put("/videos/:id", (req, res) => {
    for (let i = 0; i < db.length; i++) {
        if (db[i].id.toString() == req.params.id) {
            const body = req.body;
            const errors = validateUpdate(body);
            if (errors.length > 0) {
                res.status(404).json({
                    errorMessages: [errors]
                })
                return;
            }
            modifyObject(db[i], body);
            res.send(204);
            return;
        }
    }

    res.send(400);
})