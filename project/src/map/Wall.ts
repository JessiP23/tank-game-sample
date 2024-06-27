import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "../entities/GameEntity";
import ResourceManager from "../utils/ResourceManager";

class Wall extends GameEntity{
    private _material: MeshStandardMaterial;
    constructor(position:Vector3){
        super(position, 'general');
        const geometry = new BoxGeometry(1,1,1);
        this._material = new MeshStandardMaterial({
            map: ResourceManager.instance.getTexture('wall'),
        });
        const mesh = new Mesh(geometry, this._material);
        this._mesh = mesh;
    }

    public setColor(color: number) {
        this._material.color.set(color);
    }

    public resetColor() {
        this._material.color.set(0x808080);
    }

    public load = async () => {
        
        this._mesh.position.set(this._position.x, this._position.y, this._position.z);
        
        //create a collider for this object
        this._collider = new Box3().setFromObject(this._mesh);
    };
};

export default Wall;