import {
  Clock,
  HemisphereLight,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import GameEntity from "../entities/GameEntity";
import GameMap from "../map/GameMap";
import ResourceManager from "../utils/ResourceManager";
import Wall from "../map/Wall";
import * as THREE from 'three';
import AIEntity from "../entities/AIEntity";

type KeyboardState = {
  LeftPressed: boolean;
  RightPressed: boolean;
  UpPressed: boolean;
  DownPressed: boolean;
};

class GameScene {
  private static _instance = new GameScene();
  public static get instance() {
    return this._instance;
  }
  private _width: number;
  private _height: number;
  private _renderer: WebGLRenderer;
  private _camera: PerspectiveCamera;
  private _cameraTop: OrthographicCamera;
  private _miniMapCanvas: HTMLCanvasElement;
  private _miniMapRenderer: WebGLRenderer;
  private _aiEntities: AIEntity[] = [];
  private _selectedWall: Wall[] = [];
  private _wallsBySide: {[key: string]: Wall[]} = {};

  // three js scene
  private readonly _scene = new Scene();

  // game entities array
  private _gameEntities: GameEntity[] = [];

  private _clock:Clock = new Clock();

  //map size
  private _mapSize = 15;

  //expose the camera
  public get camera() {
    return this._camera;
  }

  //expose current entities
  public get gameEntities() {
    return this._gameEntities;
  }


  private _keyboardState: KeyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };

  private constructor() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this._width, this._height);
    // find the target html element
    const targetElement = document.querySelector<HTMLDivElement>("#app");
    if (!targetElement) {
      throw "unable to find target element";
    }
    targetElement.appendChild(this._renderer.domElement);
    // setup camera
    

    this._miniMapCanvas = document.getElementById('mini-map') as HTMLCanvasElement;
    this._miniMapRenderer = new WebGLRenderer({
      canvas: this._miniMapCanvas,
      antialias: true,
    });
    this._miniMapRenderer.setSize(200,200);

    const aspectRatio = this._width / this._height;
    this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this._camera.position.set(10,2,-10);
    this._camera.lookAt(new Vector3(0,0,0))

    const mapHalfSize = this._mapSize / 2;
    this._cameraTop = new OrthographicCamera(-mapHalfSize, mapHalfSize, mapHalfSize, -mapHalfSize);
    this._cameraTop.position.set(mapHalfSize, this._mapSize, -mapHalfSize);
    this._cameraTop.lookAt(mapHalfSize, 0, -mapHalfSize);
    this._cameraTop.updateProjectionMatrix();

    

    // listen to size change
    window.addEventListener("resize", this.resize, false);

    window.addEventListener('keydown', this.handleKeyDown, false);
    window.addEventListener("keyup", this.handleKeyUp, false);
    window.addEventListener("click", this.handleMouseClick, false);

    // add the game map
    const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize);
    this._gameEntities.push(gameMap);

  
    this.createWalls();
  }


  private handleMouseClick = (event: MouseEvent) => {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this._camera);

    const intersects = raycaster.intersectObjects(
      this._gameEntities.map((entity) => entity.mesh)
    );

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      const intersectedEntity = this._gameEntities.find(
        (entity) => entity.mesh === intersectedMesh
      );

      if (intersectedEntity instanceof Wall) {
        const side = this.getWallSide(intersectedEntity);
        if (this._selectedWall.length > 0) {
          this._selectedWall.forEach(wall => wall.resetColor);
        }

        if (side) {
          this._selectedWall = this._wallsBySide[side];
          this._selectedWall.forEach(wall => wall.setColor(0xff0000));
        }
        
      }
    }
  };

  private getWallSide(wall:Wall): string | null {
    const position = wall.mesh.position;
    if (position.z === 0) {
      return 'front';
    } else if (position.z === this._mapSize - 1) {
      return 'back';
    } else if (position.x === 0) {
      return 'left';
    } else if (position.x === this._mapSize - 1) {
      return 'right';
    }
    return null;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch(event.key) {
      case 'ArrowUp':
        this._keyboardState.UpPressed = true;
        break;
      case 'ArrowDown':
        this._keyboardState.DownPressed = true;
        break;
      case 'ArrowLeft':
        this._keyboardState.LeftPressed = true;
        break;
      case 'ArrowRight':
        this._keyboardState.RightPressed = true;
        break;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    switch(event.key) {
      case 'ArrowUp':
        this._keyboardState.UpPressed = false;
        break;
      case 'ArrowDown':
        this._keyboardState.DownPressed = false;
        break;
      case 'ArrowLeft':
        this._keyboardState.LeftPressed = false;
        break;
      case 'ArrowRight':
        this._keyboardState.RightPressed = false;
        break;
    }
  }

  private createWalls = () => {
    //helper variable for wall placement
    
    const edge = this._mapSize - 1;

    this._wallsBySide['front'] = [];
    this._wallsBySide['back'] = [];
    this._wallsBySide['left'] = [];
    this._wallsBySide['right'] = [];


    const aiEntity = new AIEntity(new Vector3(5,0,5));
    this._aiEntities.push(aiEntity);
    this._gameEntities.push(aiEntity);
    this._scene.add(aiEntity.mesh);

    for (let x = 0; x <= edge; x++) {
      this.addWall(new Vector3(x, 0, 0), 'front');
      this.addWall(new Vector3(x, 0, edge), 'back');
    }
  
    // Left and right walls (along x-axis)
    for (let z = 0; z <= edge; z++) {
      this.addWall(new Vector3(0, 0, z), 'left');
      this.addWall(new Vector3(edge, 0, z), 'right');
    }
  }

  private addWall(position: Vector3, side: string) {
    const wall = new Wall(position);
    this._gameEntities.push(wall);
    this._wallsBySide[side].push(wall);
    this._scene.add(wall.mesh);
  }

  private resize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer.setSize(this._width, this._height);
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
  };

  public load = async () => {
    // load game resources
    await ResourceManager.instance.load();

    // load game entities
    for (let index = 0; index < this._gameEntities.length; index++) {
      const element = this._gameEntities[index];
      await element.load();
      this._scene.add(element.mesh);
    }
    // add a light to the scene
    const light = new HemisphereLight(0xffffbb, 0x080820, 1);
    this._scene.rotateX(-Math.PI /2)
    this._scene.add(light);
  };

  public render = () => {
    //remove entitied no longer needed
    this.disposeEntities();
    requestAnimationFrame(this.render);
    //obtain elapsed time between frams
    const deltaT = this._clock.getDelta();
    //update the state ofa ll entities
    for (let index = 0; index < this._gameEntities.length; index++) {
      const element = this._gameEntities[index];
      element.update(deltaT); /// ???
    }

    this.updateCamera(deltaT);
    this.updateAIEntities(deltaT);


    this._renderer.render(this._scene, this._camera);
    this._miniMapRenderer.render(this._scene, this._cameraTop);  

  };

  private updateAIEntities = (delta: number) => {
    for (let aiEntity of this._aiEntities) {
      const direction = new Vector3(1,0,0);
      const raycaster = new THREE.Raycaster(aiEntity.mesh.position, direction);
      const intersects = raycaster.intersectObjects(this._gameEntities.map(entity => entity.mesh));
      if (intersects.length > 0 && intersects[0].distance < 1) {
        aiEntity.mesh.position.addScaledVector(direction.negate(), 2 * delta);
      } else {
        aiEntity.update(delta);
      }
    }
  }

  private updateCamera = (delta: number) => {
    const moveSpeed = 3;

    const forward = new Vector3();
    this._camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    let moved = false;

    if (this._keyboardState.UpPressed) {
      this.moveCamera(forward, moveSpeed * delta);
      moved = true;
    }
    if (this._keyboardState.DownPressed) {
      this.moveCamera(forward, -moveSpeed * delta);
      moved = true;
    }
    if (this._keyboardState.LeftPressed) {
      this.rotateCamera(Math.PI / 2 * delta);
    }
    if (this._keyboardState.RightPressed) {
      this.rotateCamera(-Math.PI /2 * delta);
    }

    if (moved) {
      this._camera.position.y = 2;

      this.clampCameraPosition();
    }

  }

  private moveCamera = (direction: Vector3, distance: number) => {
    const newPosition = this._camera.position.clone().addScaledVector(direction, distance);
    

    if (this.isPositionWithinMapBounds(newPosition)){
      this._camera.position.copy(newPosition);
    } else {
      console.log("New position out of bonds", newPosition);
    }
  };

  private rotateCamera = (angle: number) => {
    this._camera.rotateOnWorldAxis(new Vector3(0,1,0), angle);
  };

  private clampCameraPosition = () => {
    const halfMapSize = this._mapSize * 2;
    this._camera.position.x = THREE.MathUtils.clamp(this._camera.position.x, -halfMapSize , halfMapSize);
    this._camera.position.z = THREE.MathUtils.clamp(this._camera.position.z, -halfMapSize , halfMapSize);

  }

  private isPositionWithinMapBounds = (position: Vector3): boolean => {
    const halfMapSize = this._mapSize * 2;
    return (
      position.x >= -halfMapSize + 1 && position.x <= halfMapSize - 1 && position.z >= -halfMapSize + 1 && position.z <= halfMapSize - 1
    );
  }

  //method to dynamically add entities to the scene
  public addToScene = (entity: GameEntity) => {
    this._gameEntities.push(entity);
    this._scene.add(entity.mesh);
  };

  //method to remove entities no longer needed
  private disposeEntities = () => {
    const entitiesToBeDisposed = this._gameEntities.filter((e) => e.shouldDispose);
    entitiesToBeDisposed.forEach((element) => {
      this._scene.remove(element.mesh);
      element.dispose();
    });
    //update entities array
    this._gameEntities = [...this._gameEntities.filter((e) => !e.shouldDispose),
    ];
  }


}

export default GameScene;