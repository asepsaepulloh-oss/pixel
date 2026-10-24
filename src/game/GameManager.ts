import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BedroomScene, GameCallbacks } from './scenes/BedroomScene';
import { SoundFx } from './SoundFx';

export class GameManager {
  private static instance: GameManager | null = null;
  private game: Phaser.Game | null = null;
  private bedroomScene: BedroomScene | null = null;

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public initGame(containerId: string, callbacks: GameCallbacks): Phaser.Game {
    if (this.game) {
      return this.game;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerId,
      width: 480,
      height: 270,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#121217',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [BootScene, BedroomScene]
    };

    this.game = new Phaser.Game(config);

    // Pass callbacks to BedroomScene once it starts
    this.game.events.on(Phaser.Core.Events.READY, () => {
      const scene = this.game?.scene.getScene('BedroomScene') as BedroomScene;
      if (scene) {
        this.bedroomScene = scene;
        scene.init({ callbacks });
      }
    });

    return this.game;
  }

  public setPcOpen(isOpen: boolean): void {
    if (!this.bedroomScene && this.game) {
      this.bedroomScene = this.game.scene.getScene('BedroomScene') as BedroomScene;
    }
    if (this.bedroomScene) {
      this.bedroomScene.setPcOpen(isOpen);
    }
  }

  public setMuted(muted: boolean): void {
    SoundFx.isMuted = muted;
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.bedroomScene = null;
    }
  }
}
