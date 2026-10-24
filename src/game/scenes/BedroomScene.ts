import Phaser from 'phaser';
import { SoundFx } from '../SoundFx';
import { StorageManager } from '../../shared/storage';

export interface GameCallbacks {
  onOpenPc: () => void;
  onPlayerMove?: (x: number, y: number) => void;
}

export class BedroomScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private pcInteractZone!: Phaser.GameObjects.Zone;
  private promptText!: Phaser.GameObjects.Container;
  private isNearPc: boolean = false;
  private isPcOpen: boolean = false;
  private lastFootstepTime: number = 0;
  private currentDirection: 'down' | 'up' | 'left' | 'right' = 'down';
  private callbacks?: GameCallbacks;

  constructor() {
    super({ key: 'BedroomScene' });
  }

  init(data: { callbacks?: GameCallbacks }): void {
    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    }
  }

  create(): void {
    const mapW = 480;
    const mapH = 270;
    const tileSize = 16;

    this.physics.world.setBounds(16, 16, mapW - 32, mapH - 32);

    // 1. Draw Wooden Floor
    for (let x = 0; x < mapW; x += tileSize) {
      for (let y = 0; y < mapH; y += tileSize) {
        this.add.image(x, y, 'tile_floor').setOrigin(0, 0);
      }
    }

    // 2. Draw Walls (Top wall, left, right, bottom boundaries)
    for (let x = 0; x < mapW; x += tileSize) {
      this.add.image(x, 0, 'tile_wall').setOrigin(0, 0);
      this.add.image(x, 16, 'tile_wall').setOrigin(0, 0);
    }

    // Static obstacles group for furniture collision
    this.obstacles = this.physics.add.staticGroup();

    // Top wall boundary collision
    const topWall = this.add.rectangle(mapW / 2, 16, mapW, 32, 0x000000, 0);
    this.physics.add.existing(topWall, true);
    this.obstacles.add(topWall);

    // Side wall collision rectangles
    const leftWall = this.add.rectangle(8, mapH / 2, 16, mapH, 0x000000, 0);
    const rightWall = this.add.rectangle(mapW - 8, mapH / 2, 16, mapH, 0x000000, 0);
    const botWall = this.add.rectangle(mapW / 2, mapH - 8, mapW, 16, 0x000000, 0);
    [leftWall, rightWall, botWall].forEach(w => {
      this.physics.add.existing(w, true);
      this.obstacles.add(w);
    });

    // 3. Wall Window looking outside
    this.add.image(180, 4, 'furniture_window').setOrigin(0, 0).setDepth(2);

    // 4. Area Rug
    this.add.image(216, 130, 'furniture_rug').setOrigin(0.5, 0.5).setDepth(1);

    // 5. Furniture Placement with Collision

    // Bed and Bedside Lamp
    const bed = this.add.image(44, 46, 'furniture_bed').setOrigin(0, 0).setDepth(3);
    const bedBody = this.add.rectangle(60, 72, 28, 42, 0x000000, 0);
    this.physics.add.existing(bedBody, true);
    this.obstacles.add(bedBody);

    const nightstand = this.add.image(24, 48, 'furniture_lamp').setOrigin(0, 0).setDepth(3);
    const lampBody = this.add.rectangle(32, 60, 14, 18, 0x000000, 0);
    this.physics.add.existing(lampBody, true);
    this.obstacles.add(lampBody);

    // Warm lamp light glow
    const lampGlow = this.add.image(32, 54, 'lamp_glow').setOrigin(0.5, 0.5).setDepth(4).setAlpha(0.6);
    this.tweens.add({
      targets: lampGlow,
      alpha: { from: 0.5, to: 0.7 },
      scale: { from: 0.95, to: 1.05 },
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Wardrobe on the left
    const wardrobe = this.add.image(24, 110, 'furniture_wardrobe').setOrigin(0, 0).setDepth(3);
    const wardBody = this.add.rectangle(38, 132, 26, 40, 0x000000, 0);
    this.physics.add.existing(wardBody, true);
    this.obstacles.add(wardBody);

    // Bookshelf
    const shelf = this.add.image(120, 24, 'furniture_bookshelf').setOrigin(0, 0).setDepth(3);
    const shelfBody = this.add.rectangle(136, 44, 30, 36, 0x000000, 0);
    this.physics.add.existing(shelfBody, true);
    this.obstacles.add(shelfBody);

    // Computer Desk (The central interactive object)
    const deskX = 330;
    const deskY = 32;
    const desk = this.add.image(deskX, deskY, 'furniture_desk').setOrigin(0, 0).setDepth(3);
    const deskBody = this.add.rectangle(deskX + 24, deskY + 18, 46, 26, 0x000000, 0);
    this.physics.add.existing(deskBody, true);
    this.obstacles.add(deskBody);

    // Office Chair in front of desk
    this.add.image(deskX + 24, deskY + 36, 'furniture_chair').setOrigin(0.5, 0.5).setDepth(3);

    // Subtle CRT monitor glow
    const monitorGlow = this.add.image(deskX + 25, deskY + 12, 'lamp_glow')
      .setOrigin(0.5, 0.5)
      .setDepth(4)
      .setScale(0.5)
      .setTint(0x4ade80)
      .setAlpha(0.35);

    this.tweens.add({
      targets: monitorGlow,
      alpha: { from: 0.3, to: 0.45 },
      duration: 1800,
      yoyo: true,
      repeat: -1
    });

    // Potted Plants
    const plant1 = this.add.image(430, 36, 'furniture_plant').setOrigin(0, 0).setDepth(3);
    const plant1Body = this.add.rectangle(438, 50, 14, 20, 0x000000, 0);
    this.physics.add.existing(plant1Body, true);
    this.obstacles.add(plant1Body);

    const plant2 = this.add.image(24, 215, 'furniture_plant').setOrigin(0, 0).setDepth(3);
    const plant2Body = this.add.rectangle(32, 227, 14, 20, 0x000000, 0);
    this.physics.add.existing(plant2Body, true);
    this.obstacles.add(plant2Body);

    // 6. Player Sprite Setup
    const save = StorageManager.loadGame();
    const startX = save?.player?.x || 240;
    const startY = save?.player?.y || 160;

    this.player = this.physics.add.sprite(startX, startY, 'player', 1);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    // Tight hitbox on character's feet for smooth navigation around furniture
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset(2, 14);

    this.physics.add.collider(this.player, this.obstacles);

    // 7. Interaction Zone for the Computer Desk
    this.pcInteractZone = this.add.zone(deskX + 24, deskY + 40, 50, 40);
    this.physics.add.existing(this.pcInteractZone, true);

    // 8. Pixel Art "Press [E] to use PC" UI prompt container
    this.createInteractionPrompt(deskX + 24, deskY - 10);

    // 9. Input Setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      };

      this.wasd.E.on('down', () => {
        if (this.isNearPc && !this.isPcOpen) {
          this.triggerOpenPc();
        }
      });
    }

    // 10. Camera Configuration
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setRoundPixels(true);
  }

  private createInteractionPrompt(x: number, y: number): void {
    this.promptText = this.add.container(x, y).setDepth(100);

    // Background pill
    const bg = this.add.rectangle(0, 0, 110, 20, 0x191b22, 0.92);
    bg.setStrokeStyle(1.5, 0x4ade80);

    const text = this.add.text(0, 0, 'Press [E] to use PC', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#4ade80',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.promptText.add([bg, text]);
    this.promptText.setVisible(false);

    // Floating bobbing animation
    this.tweens.add({
      targets: this.promptText,
      y: y - 4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public triggerOpenPc(): void {
    if (this.isPcOpen) return;
    this.isPcOpen = true;

    // Halt player
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.player.anims.play(`idle-${this.currentDirection}`, true);
    this.promptText.setVisible(false);

    // Save player coordinates
    StorageManager.saveGame({
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.currentDirection
      }
    });

    SoundFx.playPcBoot();
    if (this.callbacks?.onOpenPc) {
      this.callbacks.onOpenPc();
    }
  }

  public setPcOpen(isOpen: boolean): void {
    this.isPcOpen = isOpen;
    if (!isOpen) {
      // Re-enable player controls
      if (this.isNearPc) {
        this.promptText.setVisible(true);
      }
    }
  }

  update(time: number): void {
    if (this.isPcOpen) {
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    const speed = 88; // Crisp pixel movement speed

    const left = this.cursors?.left.isDown || this.wasd?.A.isDown;
    const right = this.cursors?.right.isDown || this.wasd?.D.isDown;
    const up = this.cursors?.up.isDown || this.wasd?.W.isDown;
    const down = this.cursors?.down.isDown || this.wasd?.S.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Normalizing diagonal movement speed so diagonal walk is not faster
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    body.setVelocity(vx * speed, vy * speed);

    // Update animations and footstep sounds
    const isMoving = vx !== 0 || vy !== 0;

    if (isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.currentDirection = vx < 0 ? 'left' : 'right';
      } else {
        this.currentDirection = vy < 0 ? 'up' : 'down';
      }
      this.player.anims.play(`walk-${this.currentDirection}`, true);

      // Footstep audio cadence (every 320ms while walking)
      if (time - this.lastFootstepTime > 320) {
        this.lastFootstepTime = time;
        SoundFx.playFootstep();
      }
    } else {
      this.player.anims.play(`idle-${this.currentDirection}`, true);
    }

    // Check distance to computer desk for interaction
    const distToPc = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.pcInteractZone.x,
      this.pcInteractZone.y
    );

    const near = distToPc < 36;
    if (near !== this.isNearPc) {
      this.isNearPc = near;
      this.promptText.setVisible(near && !this.isPcOpen);
      if (near && !this.isPcOpen) {
        SoundFx.playInteractPrompt();
      }
    }
  }
}
