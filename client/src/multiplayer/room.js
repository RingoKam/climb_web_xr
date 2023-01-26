import * as Colyseus from "colyseus.js"
import { getChangesValue } from './helper'
import {
  InterpolationBuffer,
  BufferState,
  BufferMode
} from "buffered-interpolation-babylon";

export const createRoom = async (
  createHeadMesh,
  createLeftHandMesh,
  createRightHandMesh
) => {

  // DEV URL
  const wsURL = import.meta.env.VITE_WS_URL
  // Prod url

  var colyseusClient = new Colyseus.Client(wsURL)

  let room = await colyseusClient.joinOrCreate("default_room", {})
  console.log(room.sessionId)

  const networkedPlayers = {}

  const createPlayer = async (key, player) => {
    const head = await createHeadMesh(key)
    const leftHand = await createLeftHandMesh(key)
    const rightHand = await createRightHandMesh(key)

    const headBuffer = new InterpolationBuffer(BufferMode.MODE_LERP, 0.1);
    const leftHandBuffer = new InterpolationBuffer(BufferMode.MODE_LERP, 0.1);
    const rightHandBuffer = new InterpolationBuffer(BufferMode.MODE_LERP, 0.1);

    player.head.onChange = (changes) => {
      const delta = getChangesValue(changes)
      console.log(key, delta)
      const { position, rotation } = delta;
      headBuffer.appendBuffer(position, null, rotation, null)
    }

    player.left.onChange = (changes) => {
      const delta = getChangesValue(changes)
      console.log(key, delta)
      const { position, rotation } = delta;
      leftHandBuffer.appendBuffer(position, null, rotation, null)
    }

    player.right.onChange = (changes) => {
      const delta = getChangesValue(changes)
      console.log(key, delta)
      const { position, rotation } = delta;
      rightHandBuffer.appendBuffer(position, null, rotation, null)
    }

    return {
      head,
      leftHand,
      rightHand,
      headBuffer,
      leftHandBuffer,
      rightHandBuffer
    } 
  }

  room.onStateChange.once(async (state) => {
    state.players.forEach(async p => {
      if(p.sessionId === room.sessionId) return
      networkedPlayers[p.sessionId] = await createPlayer(p.sessionId, p)  
    });

    state.players.onAdd = async (player, key) => {
      // ignore changes from current client
      if(key === room.sessionId) return
      networkedPlayers[key] = await createPlayer(key, player)  
      player.triggerAll();
    }
    
    state.players.onRemove = async (player, key) => {
      networkedPlayers[key].head.dispose()
      networkedPlayers[key].leftHand.dispose()
      networkedPlayers[key].rightHandBuffer.dispose()
      delete networkedPlayers[key]
    } 
  })

  console.log("Colyseus setup and connected!")

  return {
    room,
    networkedPlayers
  }
}



