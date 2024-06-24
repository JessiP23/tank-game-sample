import { Box3, Material, Mesh, MeshPhongMaterial, Sphere, SphereGeometry, Vector3 } from "three";
import GameEntity from "./GameEntity";
import GameScene from "../scene/GameScene";

class Bullet extends GameEntity{
    private _angle:number;

    constructor(position:Vector3, angle:number){
        super(position, 'bullet');
        this._angle = angle;
    }

    public load = async () => {
        const bulletGeometry = new SphereGeometry(0.085);
        const bulletMaterial = new MeshPhongMaterial({color: 0x262626});

        this._mesh = new Mesh(bulletGeometry, bulletMaterial);
        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z,
        );

        //create the collidor
        this._collider = new Box3().setFromObject(this._mesh).getBoundingSphere(new Sphere(this._mesh.position));
    };

    //update method
    public update = (deltaT: number) => {
        const travelSpeed = 9;
        const computerMovement = new Vector3(travelSpeed * Math.sin(this._angle) * deltaT, -travelSpeed * Math.cos(this._angle) * deltaT, 0);
        //move the bullet and its collider
        this._mesh.position.add(computerMovement);
        //check for collisions.
        const colliders = GameScene.instance.gameEntities.filter((c) => c.collider && c !== this && c.entityType !== 'player' && c.collider.intersectsSphere(this._collider as Sphere))

         //if there is a collision this bullet can be disposed
        if (colliders.length) {
           this._shouldDispose = true; 
        }
    };

    public dispose = () => {
        (this._mesh.material as Material).dispose();
        this._mesh.geometry.dispose();
    }
}
export default Bullet;