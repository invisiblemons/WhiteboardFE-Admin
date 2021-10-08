export class Campaign {
    id: string;
    name: string;
    description: string;
    startDay: Date;
    endDay: Date;
    image: string;

    constructor() {
        this.name = "";
        this.description = "";
        this.startDay = new Date();
        this.endDay = new Date();
        this.image = "";
    }
}

export class Criteria {
    id: string;
    name: string;

    constructor() {
        this.id = "";
        this.name = "";
    }
}