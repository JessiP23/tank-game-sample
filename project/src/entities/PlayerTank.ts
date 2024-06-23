import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";

//helper to track keyboard state
type keyboardState = {
    LeftPressed:boolean;
    RightPressed:boolean;
    UpPressed:boolean;
    DownPressed:boolean;
};

class PlayerTank extends GameEntity {

    private _keyboardState: keyboardState = {
        LeftPressed: false,
        RightPressed: false,
        UpPressed: false,
        DownPressed: false,
    };

  constructor(position: Vector3) {
    super(position);
    // listen to the methods that track keyboard state.
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  //handle key pressing
  private handleKeyDown = (e:KeyboardEvent) => {
    switch (e.key) {
        case "ArrowUp":
            this._keyboardState.UpPressed = true;
            break;
        case "ArrowDown":
            this._keyboardState.DownPressed = true;
            break;

    
        default:
            break;
    }
  };

  private handleKeyUp = (e:KeyboardEvent) => {
    switch (e.key) {
        case "ArrowUp":
            this._keyboardState.UpPressed = false;
            break;
        case "ArrowDown":   
            this._keyboardState.DownPressed = false;
            break;
        default:
            break;
    }
  }

  public load = async () => {
    // ask the models and textures to the resource manager
    const tankModel = ResourceManager.instance.getModel("tank");
    if (!tankModel) {
      throw "unable to get tank model";
    }
    // the model contains the meshes we need for the scene
    const tankBodyMesh = tankModel.scene.children.find(
      (m) => m.name === "Body"
    ) as Mesh;

    const tankTurretMesh = tankModel.scene.children.find(
      (m) => m.name === "Turret"
    ) as Mesh;

    const tankBodyTexture = ResourceManager.instance.getTexture("tank-body");
    const tankTurretTexture =
      ResourceManager.instance.getTexture("tank-turret");

    if (
      !tankBodyMesh ||
      !tankTurretMesh ||
      !tankBodyTexture ||
      !tankTurretTexture
    ) {
      throw "unable to load player model or textures";
    }

    // with all the assets we can build the final mesh and materials
    const bodyMaterial = new MeshStandardMaterial({
      map: tankBodyTexture,
    });
    const turretMaterial = new MeshStandardMaterial({
      map: tankTurretTexture,
    });

    tankBodyMesh.material = bodyMaterial;
    tankTurretMesh.material = turretMaterial;

    // add meshes as child of entity mesh
    this._mesh.add(tankBodyMesh);
    this._mesh.add(tankTurretMesh);
  };

  public update = (deltaT:number) => {
    let computedMovement = new Vector3(); //final movement for this frame
    const moveSpeed = 2; //in tiles per second
    const yMovement = moveSpeed * deltaT; //this is not running every second
    if (this._keyboardState.UpPressed) {
        computedMovement = new Vector3(0, -yMovement, 0);
    } else if (this._keyboardState.DownPressed) {
        computedMovement = new Vector3(0, yMovement,0);
    }

    //update teh current position by adding the movement
    this._mesh.position.add(computedMovement);
  }
}

export default PlayerTank;