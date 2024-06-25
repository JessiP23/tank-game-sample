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

    // add the game map
    const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize);
    this._gameEntities.push(gameMap);

  
    this.createWalls();
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

    //add a edge walls
    this._gameEntities.push(new Wall(new Vector3(0,0,0)));
    this._gameEntities.push(new Wall(new Vector3(edge,0,0)));
    this._gameEntities.push(new Wall(new Vector3(edge,edge,0)));
    this._gameEntities.push(new Wall(new Vector3(0, edge,0)));

    //fill in the gaps between the edge walls
    for (let i = 1; i < edge; i++) {
      this._gameEntities.push(new Wall(new Vector3(i,0,0)));
      this._gameEntities.push(new Wall(new Vector3(0,i,0)));
      this._gameEntities.push(new Wall(new Vector3(edge,i,0)));
      this._gameEntities.push(new Wall(new Vector3(i, edge,0)));
    }
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

    this._renderer.render(this._scene, this._camera);
    this._miniMapRenderer.render(this._scene, this._cameraTop);

  };

  private updateCamera = (delta: number) => {
    const moveSpeed = 3;
    const rotationSpeed = Math.PI /2;



    if (this._keyboardState.UpPressed) {
      this._camera.position.z -= moveSpeed * delta;
    }
    if (this._keyboardState.DownPressed) {
      this._camera.position.z += moveSpeed * delta;
    }
    if (this._keyboardState.LeftPressed) {
      this._camera.rotation.y += rotationSpeed * delta;
    }
    if (this._keyboardState.RightPressed) {
      this._camera.rotation.y -= rotationSpeed* delta;
    }
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