export class Envelope<T> {
  public constructor(public userId: number, public content: T) {}
}
