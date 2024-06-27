import { Vector3, BoxGeometry, MeshBasicMaterial, Mesh} from "three";
import GameEntity from "./GameEntity";

class AIEntity extends GameEntity {
    constructor(position: Vector3) {
        const geometry = new BoxGeometry(1,1,1);
        const material = new MeshBasicMaterial({color:0x00ff00});
        const mesh = new Mesh(geometry, material);
        super(position, 'general');
        this._mesh = mesh;
    }

    public update(delta: number) {
        const moveSpeed = 2;
        const direction = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        this.mesh.position.addScaledVector(direction, moveSpeed * delta);
    }
}

export default AIEntity;