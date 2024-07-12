import { Vector3, Mesh, BoxGeometry, MeshStandardMaterial, Box3, DoubleSide, RepeatWrapping, TextureLoader } from "three";
import GameEntity from "../entities/GameEntity";

class Roof extends GameEntity {
    private _material: MeshStandardMaterial = new MeshStandardMaterial;
    constructor(position: Vector3) {
        super(position, 'general');
        const geometry = new BoxGeometry(30, 30, 1);

        const textureLoaded = new TextureLoader();
        textureLoaded.load("textures/wall.png", (texture) => {
            this._material = new MeshStandardMaterial({
                map: texture,
                side: DoubleSide,
            });

            if (this._material.map) {
                this._material.map.repeat.set(1, 1); // repeat the texture on both X and Y axes
                this._material.map.wrapS = RepeatWrapping; // wrap the texture on the X-axis
                this._material.map.wrapT = RepeatWrapping; // wrap the texture on the Y-axis
            }
    
            const mesh = new Mesh(geometry, this._material);
            this._mesh = mesh;
        })

    }

    public setColor(color:number) {
        this._material.color.set(color);
    }

    public load = async () => {
        this._mesh.position.set(this._position.x, this._position.y, this._position.z);

        // create a collider for this project
        this._collider = new Box3().setFromObject(this._mesh);
    }
}

export default Roof;