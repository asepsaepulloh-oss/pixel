import Phaser from 'phaser';
import { TextureGenerator } from '../TextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    TextureGenerator.generateAll(this);
    this.createPlayerAnimations();
    this.scene.start('BedroomScene');
  }

  private createPlayerAnimations(): void {
    const anims = this.anims;

    // Row 0 = down, Row 1 = left, Row 2 = right, Row 3 = up
    // Frame 0 = walk1, Frame 1 = idle, Frame 2 = walk2
    anims.create({
      key: 'idle-down',
      frames: [{ key: 'player', frame: 1 }],
      frameRate: 1
    });
    anims.create({
      key: 'walk-down',
      frames: [
        { key: 'player', frame: 0 },
        { key: 'player', frame: 1 },
        { key: 'player', frame: 2 },
        { key: 'player', frame: 1 }
      ],
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'idle-left',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 1
    });
    anims.create({
      key: 'walk-left',
      frames: [
        { key: 'player', frame: 3 },
        { key: 'player', frame: 4 },
        { key: 'player', frame: 5 },
        { key: 'player', frame: 4 }
      ],
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'idle-right',
      frames: [{ key: 'player', frame: 7 }],
      frameRate: 1
    });
    anims.create({
      key: 'walk-right',
      frames: [
        { key: 'player', frame: 6 },
        { key: 'player', frame: 7 },
        { key: 'player', frame: 8 },
        { key: 'player', frame: 7 }
      ],
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'idle-up',
      frames: [{ key: 'player', frame: 10 }],
      frameRate: 1
    });
    anims.create({
      key: 'walk-up',
      frames: [
        { key: 'player', frame: 9 },
        { key: 'player', frame: 10 },
        { key: 'player', frame: 11 },
        { key: 'player', frame: 10 }
      ],
      frameRate: 8,
      repeat: -1
    });
  }
}
