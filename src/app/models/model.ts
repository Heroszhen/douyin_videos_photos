export abstract class Model {
    assignData(data: object): void {
        Object.assign(this, data);
    }
}