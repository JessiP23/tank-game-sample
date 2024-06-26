import { Mesh, Vector3, Box3, Sphere } from "three";

//discriminator for the type of entity
type EntityType = 'general' | "player" | "bullet";

abstract class GameEntity {
  protected _position: Vector3;
  protected _mesh: Mesh = new Mesh();
  public get mesh() {
    return this._mesh;
  }

  protected _collider?: Box3 | Sphere;
  public get collider() {
    if (!this._collider) {
      throw new Error("Collider is not set");
    }
    return this._collider;
  }

  public set collider(value: Box3 | Sphere) {
    this._collider = value;
  }

  protected _entityType: EntityType;
  public get entityType() {
    return this._entityType;
  }

  //flag to let the GameScene konw this entity will be disposed
  protected _shouldDispose = false;
  public get shouldDispose() {
    return this._shouldDispose;
  }

  constructor(position: Vector3, entityType:EntityType = 'general') {
    this._position = position;
    this._mesh.position.set(
      this._position.x,
      this._position.y,
      this._position.z
    );
    this._entityType = entityType;
  }

  // methods
  public async load(){};
  public update(_deltaT: number){};

  //method to be called before disposing the entity (to free resources)
  public dispose() {};
}

export default GameEntity;