import { Room, Client } from "colyseus";
import { MyRoomState, Vector } from "./schema/MyRoomState";
import { Player } from './schema/MyRoomState'

export class MyRoom extends Room<MyRoomState> {

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.onMessage("player-update", (client, { head, right, left }) => {
      const player = this.state.players.get(client.sessionId);
      if(player) {
        player.head.assign({
          position: new Vector().assign(head.position),
          rotation: new Vector().assign(head.rotation)
        })
        player.right.position.assign(right.position)
        player.right.rotation.assign(right.rotation)
        player.left.position.assign(left.position)
        player.left.rotation.assign(left.rotation)
      } else {
        console.warn("player not found!")
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    player.sessionId = client.sessionId;
    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
