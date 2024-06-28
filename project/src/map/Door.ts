import 'three';
import { BoxGeometry, Mesh, MeshPhysicalMaterial, Quaternion, Vector3 } from 'three';
import GameEntity from '../entities/GameEntity';

class Door extends GameEntity {
    private _isOpen: boolean;
    private _initialRotation: Quaternion;
    private _targetRotation: Quaternion;

    constructor(position:Vector3) {
        super(position, 'general');
        const geometry = new BoxGeometry(1, 1, 5);
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

    public async load(): Promise<void> {}

    public update(): void{
        const slerpDelta = 0.1;
        this._mesh.quaternion.slerp(this._targetRotation, slerpDelta);
    }
}

export default Door;