import { Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

class ResourceManager{
    private static _instance = new ResourceManager()
    public static get instance() {
        return this._instance;
    }
    private constructor() {}

    //resource list
    private _groundTextures: Texture[] =[];
    private _models = new Map<string, GLTF>()
    private _textures = new Map<string, Texture>();

    //public methods to access games loaded resources
    public getModel(modelName:string): GLTF | undefined {
        return this._models.get(modelName);
    }

    public getTexture(textureName:string): Texture | undefined {
        return this._textures.get(textureName);
    }

    //load entry point
    public load = async () => {
        //create a unique texture loader
        const textureLoader = new TextureLoader();
        await this.loadGroundTextures(textureLoader);
        await this.loadTextures(textureLoader);
        await this.loadModels();
    };

    private loadModels = async () => {
        //instance a model loader
        const modelLoader = new GLTFLoader();
        const playerTank = await modelLoader.loadAsync("models/tank.plb");
        this._models.set('tank', playerTank);
    }

    private loadTextures = async(textureLoader:TextureLoader) => {
        //load game textures
        // player tank
        const tankBodyTexture = await textureLoader.loadAsync('textures/tank-body.png');
        const tankTurrentTexture = await textureLoader.loadAsync("textures/tank-turrent.png");

        //add to the game resources
        this._textures.set('tank-body', tankBodyTexture);
        this._textures.set('tank-turret', tankTurrentTexture);
    }

    //method for gorund textures loading
    private loadGroundTextures = async (textureLoader: TextureLoader) => {
        const groundTextureFiles = ['g1.png', 'g2.png', 'g3.png', 'g4.png', 'g5.png', 'g6.png', 'g7.png', 'g8.png',];

        //load the textures
        for (let index = 0; index < groundTextureFiles.length; index++) {
            const element = groundTextureFiles[index];
            const texture = await textureLoader.loadAsync(`textures/${element}`);
            this._groundTextures.push(texture);
        }
    };

    public getRandomGroundTexture = () => {
        return this._groundTextures[
            Math.floor(Math.random() * this._groundTextures.length)
        ]
    }
}

export default ResourceManager;