import { Schema, Context, MapSchema, type } from "@colyseus/schema";

export class Vector extends Schema {
  @type("float32") x = 0.0;
  @type("float32") y = 0.0;
  @type("float32") z = 0.0;
}

export class Transform extends Schema {
  @type(Vector) position = new Vector()
  @type(Vector) rotation = new Vector()
}

export class Player extends Schema {
  @type(Transform) head = new Transform()
  @type(Transform) left = new Transform()
  @type(Transform) right = new Transform()
  @type("string") sessionId = "" 
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
