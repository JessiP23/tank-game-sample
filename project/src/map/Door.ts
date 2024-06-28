import 'three';
import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
class Door {
    private _mesh:Mesh;

    constructor(position:Vector3) {
        const geometry = new BoxGeometry(0.2, 0.5, 0.05);
        const material = new MeshStandardMaterial({color: 0x8b4513});
        this._mesh = new Mesh(geometry, material);
        this._mesh.position.copy(position);
    }

    public get mesh():Mesh{
        return this._mesh;
    }
}

export default Door;