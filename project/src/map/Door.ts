import 'three';
import { BoxGeometry, Mesh, MeshPhysicalMaterial, Quaternion, Vector3 } from 'three';
class Door {
    private _mesh:Mesh;
    private _isOpen: boolean;
    private _initialRotation: Quaternion;
    private _targetRotation: Quaternion;

    constructor(position:Vector3) {
        const geometry = new BoxGeometry(0.2, 0.5, 0.05);
        const material = new MeshPhysicalMaterial({
            color: 0x8b4513,
            metalness: 0.8,
            roughness: 0.5,
        });

        this._mesh = new Mesh(geometry, material);
        this._mesh.position.copy(position);

        this._initialRotation = this._mesh.quaternion.clone();
        this._targetRotation = this._initialRotation.clone();

        this._isOpen = false;

        this._mesh.userData.onClick = () => {
            this.toggleDoor();
        };
    }

    public get mesh():Mesh{
        return this._mesh;
    }

    public toggleDoor(): void {
        this._isOpen = !this._isOpen;

        if (this._isOpen) {
            this._targetRotation.setFromAxisAngle(new Vector3(0,1,0), Math.PI / 2);
        } else {
            this._targetRotation.copy(this._initialRotation);
        }
    }

    public update(): void{
        const delta = 0.1;
        this._mesh.quaternion.slerp(this._targetRotation, delta);
    }
}

export default Door;