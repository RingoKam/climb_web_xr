import {
  Vector3,
  Engine,
  Scene,
  Mesh,
  HemisphericLight,
  WebXREnterExitUIOptions,
  WebXREnterExitUIButton,
  UniversalCamera,
  StandardMaterial,
  Color3,
  MeshBuilder
} from '@babylonjs/core'
import '@babylonjs/inspector'
import { throttle } from 'lodash'
import { createRoom } from '../multiplayer/room'

export const wrapper = {
  engine: null,
  scene: null,
  createScene: async (canvas) => {
    // Create and customize the scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);
    
    // Show inspector.
    scene.debugLayer.show({
      embedMode: true,
    });
    
    // env
    const env = scene.createDefaultEnvironment();

    // light
    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene)

    // camera
    var camera = new UniversalCamera('camera', new Vector3(0, 3, 0), scene)
    camera.applyGravity = true
    camera.checkCollisions = true
    camera.speed = 0.5

    // scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 0.8, -4);

    // Make some boxes to test out the colors in VR
    const group = new Mesh("color-group");
    group.position = new Vector3(0, 0.5, 10);
    makeBox("red", group, scene);

    //Setup custom VR button
    const customVRButton = makeVRButton()
    document.body.appendChild(customVRButton);
    var customXRButton = new WebXREnterExitUIButton(customVRButton, "immersive-vr", "local-floor");
    var xrOptions = new WebXREnterExitUIOptions();
    xrOptions.customButtons = [customXRButton];

    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [env.ground],
      uiOptions: xrOptions
    });

    const createHand = (handedness) => async (sessionId) => {
      const handMesh = MeshBuilder.CreateSphere(sessionId + "-hand-" + handedness, {
        diameter: 0.2
      })
      return handMesh
    }

    async function createHead(sessionId) {
      const handMesh = MeshBuilder.CreateSphere(sessionId, {
        diameter: 1
      })
      return handMesh
    }

    const { room, networkedPlayers } = await createRoom(createHead, createHand('left'), createHand('right'))

    function cameraUpdate() {
      const camera = xr.baseExperience.camera
      const position = extractXYZ(camera.position)
      const rotation = extractXYZ(camera.rotation)
      return { position, rotation }
    }

    function handUpdate() {
      const hands = {}
      xr.input.controllers.forEach(controller => {
        const hand = controller.inputSource.handedness.toLocaleLowerCase()
        const position = extractXYZ(controller.grip._absolutePosition)
        const rotation = extractXYZ(controller.grip.absoluteRotationQuaternion)
        // do something here
        hands[hand] = { position, rotation }
      })
      return hands
    }

    const throttledUpdatePlayer = throttle(() => {
      const payload = {
        head: cameraUpdate(),
        ...handUpdate()
      }
      room.send("player-update", payload)
    })

    engine.runRenderLoop(() => {
      scene.render();

      const isVRWorking = xr.baseExperience.state === 2

      if (isVRWorking) {
        throttledUpdatePlayer()
      }

      // update network players 
      Object.entries(networkedPlayers).forEach(([key, player]) => {
        player.headBuffer.update(scene.deltaTime)
        player.head.position.copyFrom(player.headBuffer.position)
        // player.head.rotation.copyFrom(player.headBuffer.quaternion)
        
        player.leftHandBuffer.update(scene.deltaTime)
        player.leftHand.position.copyFrom(player.leftHandBuffer.position)
        // player.leftHand.rotation.copyFrom(player.leftHandBuffer.quaternion)
        
        player.rightHandBuffer.update(scene.deltaTime)
        player.rightHand.position.copyFrom(player.rightHandBuffer.position)
        // player.rightHand.rotation.copyFrom(player.rightHandBuffer.quaternion)
      })
    });
  }
};

function extractXYZ(obj) {
  return {
    x: obj.x,
    y: obj.y,
    z: obj.z
  }
}

const makeVRButton = () => {
  const customVRButton = document.createElement("button");
  customVRButton.id = "customVRButton";
  customVRButton.className = "customVRicon";
  customVRButton.style.zIndex = "5";
  customVRButton.style.left = 0;
  customVRButton.style.right = 0;
  customVRButton.style.marginLeft = "auto";
  customVRButton.style.marginRight = "auto";
  customVRButton.textContent = "Enter in VR"
  customVRButton.style.width = "150px";
  customVRButton.style.height = "50px";

  return customVRButton
}

const makeBox = (colorName, parent, scene) => {
  // Create a colored box from using a string to get the color from the Brand object
  const mat = new StandardMaterial(`${colorName}-material`, scene);
  // mat.diffuseColor = 
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  const mesh = MeshBuilder.CreateBox(
    `${colorName}-box`,
    { size: 1 },
    scene
  );
  mesh.material = mat;
  mesh.parent = parent;

  return mesh;
};