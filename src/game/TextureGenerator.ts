import Phaser from 'phaser';

/**
 * Procedural Pixel-Art Texture Generator
 * Creates authentic 16-bit cozy retro sprites and tiles directly on canvas.
 * Guarantees zero missing asset errors across any deployment.
 */
export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    if (scene.textures.exists('player')) return;

    this.createPlayerSpritesheet(scene);
    this.createBedroomTiles(scene);
    this.createFurnitureSprites(scene);
    this.createParticleTextures(scene);
  }

  private static createPlayerSpritesheet(scene: Phaser.Scene): void {
    // 16x24 per frame. 4 directions: down (row 0), left (row 1), right (row 2), up (row 3)
    // 3 frames per direction: walk1, idle, walk2
    const frameW = 16;
    const frameH = 24;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * 3;
    canvas.height = frameH * 4;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Palette
    const skin = '#ffd1a4';
    const skinShadow = '#e0a97a';
    const hair = '#5c3826';
    const hairHighlight = '#7a4e37';
    const sweater = '#d95763';
    const sweaterShadow = '#ac3232';
    const pants = '#3f477e';
    const shoes = '#2c2137';
    const eyes = '#222034';

    const drawCharacter = (
      col: number,
      row: number,
      dir: 'down' | 'left' | 'right' | 'up',
      frame: 0 | 1 | 2
    ) => {
      const ox = col * frameW;
      const oy = row * frameH;
      const legOffset = frame === 0 ? -1 : frame === 2 ? 1 : 0;

      // Shadow on floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(ox + 8, oy + 22, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair & Head
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 4, oy + 2, 8, 4);
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(ox + 5, oy + 2, 4, 2);

      // Face
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 4, oy + 5, 8, 6);

      // Face features based on direction
      if (dir === 'down') {
        // Eyes
        ctx.fillStyle = eyes;
        ctx.fillRect(ox + 5, oy + 7, 2, 2);
        ctx.fillRect(ox + 9, oy + 7, 2, 2);
        // Blush
        ctx.fillStyle = '#ff9999';
        ctx.fillRect(ox + 4, oy + 9, 2, 1);
        ctx.fillRect(ox + 10, oy + 9, 2, 1);
      } else if (dir === 'up') {
        // Back of head (all hair)
        ctx.fillStyle = hair;
        ctx.fillRect(ox + 4, oy + 4, 8, 7);
      } else if (dir === 'left') {
        ctx.fillStyle = eyes;
        ctx.fillRect(ox + 5, oy + 7, 2, 2);
        ctx.fillStyle = hair;
        ctx.fillRect(ox + 8, oy + 3, 4, 6);
      } else if (dir === 'right') {
        ctx.fillStyle = eyes;
        ctx.fillRect(ox + 9, oy + 7, 2, 2);
        ctx.fillStyle = hair;
        ctx.fillRect(ox + 4, oy + 3, 4, 6);
      }

      // Torso (Sweater)
      ctx.fillStyle = sweater;
      ctx.fillRect(ox + 4, oy + 11, 8, 6);
      ctx.fillStyle = sweaterShadow;
      ctx.fillRect(ox + 4, oy + 16, 8, 1);

      // Arms
      ctx.fillStyle = sweater;
      if (dir === 'down' || dir === 'up') {
        ctx.fillRect(ox + 2, oy + 11, 2, 5);
        ctx.fillRect(ox + 12, oy + 11, 2, 5);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 2, oy + 16, 2, 1);
        ctx.fillRect(ox + 12, oy + 16, 2, 1);
      } else if (dir === 'left') {
        ctx.fillRect(ox + 6, oy + 12, 3, 4);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 5, oy + 15, 2, 2);
      } else if (dir === 'right') {
        ctx.fillRect(ox + 7, oy + 12, 3, 4);
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 9, oy + 15, 2, 2);
      }

      // Legs / Pants
      ctx.fillStyle = pants;
      if (dir === 'left' || dir === 'right') {
        ctx.fillRect(ox + 5, oy + 17, 6, 4);
      } else {
        ctx.fillRect(ox + 5, oy + 17, 2, 4 + legOffset);
        ctx.fillRect(ox + 9, oy + 17, 2, 4 - legOffset);
      }

      // Shoes
      ctx.fillStyle = shoes;
      if (dir === 'left') {
        ctx.fillRect(ox + 4 + legOffset, oy + 21, 4, 2);
      } else if (dir === 'right') {
        ctx.fillRect(ox + 8 + legOffset, oy + 21, 4, 2);
      } else {
        ctx.fillRect(ox + 4, oy + 21 + legOffset, 3, 2);
        ctx.fillRect(ox + 9, oy + 21 - legOffset, 3, 2);
      }
    };

    const directions: ('down' | 'left' | 'right' | 'up')[] = ['down', 'left', 'right', 'up'];
    directions.forEach((dir, row) => {
      drawCharacter(0, row, dir, 0); // walk1
      drawCharacter(1, row, dir, 1); // idle
      drawCharacter(2, row, dir, 2); // walk2
    });

    scene.textures.addSpriteSheet('player', canvas as unknown as HTMLImageElement, {
      frameWidth: frameW,
      frameHeight: frameH
    });
  }

  private static createBedroomTiles(scene: Phaser.Scene): void {
    // Floor Tile (16x16)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 16;
    floorCanvas.height = 16;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#9b643a';
    fCtx.fillRect(0, 0, 16, 16);
    // Wood grain planks
    fCtx.fillStyle = '#84502d';
    fCtx.fillRect(0, 7, 16, 1);
    fCtx.fillRect(0, 15, 16, 1);
    fCtx.fillStyle = '#b37648';
    fCtx.fillRect(0, 0, 16, 1);
    fCtx.fillRect(0, 8, 16, 1);
    // Subtle nail/grain marks
    fCtx.fillStyle = '#6d4023';
    fCtx.fillRect(3, 3, 1, 1);
    fCtx.fillRect(12, 11, 1, 1);
    scene.textures.addCanvas('tile_floor', floorCanvas);

    // Wall Tile (16x16)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 16;
    wallCanvas.height = 16;
    const wCtx = wallCanvas.getContext('2d')!;
    wCtx.fillStyle = '#2f3442';
    wCtx.fillRect(0, 0, 16, 16);
    // Top trim & subtle vertical wallpaper stripe
    wCtx.fillStyle = '#393f50';
    wCtx.fillRect(0, 0, 16, 2);
    wCtx.fillRect(7, 2, 2, 14);
    // Baseboard trim at bottom
    wCtx.fillStyle = '#593a28';
    wCtx.fillRect(0, 13, 16, 3);
    wCtx.fillStyle = '#422a1b';
    wCtx.fillRect(0, 15, 16, 1);
    scene.textures.addCanvas('tile_wall', wallCanvas);

    // Cozy Rug (48x32)
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 48;
    rugCanvas.height = 32;
    const rCtx = rugCanvas.getContext('2d')!;
    rCtx.fillStyle = '#78383b';
    rCtx.fillRect(0, 0, 48, 32);
    // Inner border
    rCtx.strokeStyle = '#c48b59';
    rCtx.lineWidth = 2;
    rCtx.strokeRect(3, 3, 42, 26);
    // Pattern diamonds
    rCtx.fillStyle = '#d4aa78';
    rCtx.fillRect(12, 14, 4, 4);
    rCtx.fillRect(24, 14, 4, 4);
    rCtx.fillRect(36, 14, 4, 4);
    // Fringes
    rCtx.fillStyle = '#e8d5b5';
    for (let x = 1; x < 48; x += 3) {
      rCtx.fillRect(x, 0, 1, 1);
      rCtx.fillRect(x, 31, 1, 1);
    }
    scene.textures.addCanvas('furniture_rug', rugCanvas);
  }

  private static createFurnitureSprites(scene: Phaser.Scene): void {
    // Bed (32x48)
    const bedCanvas = document.createElement('canvas');
    bedCanvas.width = 32;
    bedCanvas.height = 48;
    const bCtx = bedCanvas.getContext('2d')!;
    // Wooden headboard
    bCtx.fillStyle = '#593a28';
    bCtx.fillRect(2, 2, 28, 8);
    bCtx.fillStyle = '#7a4f37';
    bCtx.fillRect(4, 3, 24, 4);
    // Bed frame
    bCtx.fillStyle = '#422a1b';
    bCtx.fillRect(2, 8, 28, 38);
    // Mattress & White Pillows
    bCtx.fillStyle = '#e3dec3';
    bCtx.fillRect(4, 9, 24, 35);
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(6, 10, 9, 7);
    bCtx.fillRect(17, 10, 9, 7);
    bCtx.fillStyle = '#c7c2a7';
    bCtx.strokeRect(6, 10, 9, 7);
    bCtx.strokeRect(17, 10, 9, 7);
    // Blanket / Quilt (cozy teal/sage green)
    bCtx.fillStyle = '#3a6b66';
    bCtx.fillRect(4, 19, 24, 25);
    // Quilt fold & stitches
    bCtx.fillStyle = '#4a827c';
    bCtx.fillRect(4, 19, 24, 3);
    bCtx.fillStyle = '#ffd166';
    bCtx.fillRect(15, 28, 2, 2);
    bCtx.fillRect(8, 36, 2, 2);
    bCtx.fillRect(22, 36, 2, 2);
    scene.textures.addCanvas('furniture_bed', bedCanvas);

    // Computer Desk with Monitor, Keyboard, Mouse (48x32)
    const deskCanvas = document.createElement('canvas');
    deskCanvas.width = 48;
    deskCanvas.height = 32;
    const dCtx = deskCanvas.getContext('2d')!;
    // Wooden desk top
    dCtx.fillStyle = '#68452b';
    dCtx.fillRect(0, 10, 48, 22);
    dCtx.fillStyle = '#875b3b';
    dCtx.fillRect(1, 10, 46, 3);
    // Desk legs & side drawers
    dCtx.fillStyle = '#4f331f';
    dCtx.fillRect(2, 16, 10, 15);
    dCtx.fillStyle = '#c48b59';
    dCtx.fillRect(6, 21, 2, 2);
    dCtx.fillRect(6, 27, 2, 2);

    // CRT Monitor (retro beige with green/amber phosphor screen)
    dCtx.fillStyle = '#dcd6cd';
    dCtx.fillRect(16, 2, 18, 15);
    dCtx.fillStyle = '#9e978e';
    dCtx.fillRect(17, 3, 16, 1);
    dCtx.fillStyle = '#22252a';
    dCtx.fillRect(18, 4, 14, 11);
    // Glowing screen content (green command prompt / desktop)
    dCtx.fillStyle = '#4ade80';
    dCtx.fillRect(19, 6, 8, 2);
    dCtx.fillRect(19, 9, 10, 2);
    dCtx.fillRect(19, 12, 4, 2);
    // Monitor stand
    dCtx.fillStyle = '#b8b2a7';
    dCtx.fillRect(23, 17, 4, 2);

    // Keyboard & Mouse
    dCtx.fillStyle = '#dcd6cd';
    dCtx.fillRect(17, 21, 12, 4);
    dCtx.fillStyle = '#888';
    dCtx.fillRect(18, 22, 10, 2);
    dCtx.fillStyle = '#dcd6cd';
    dCtx.fillRect(32, 22, 3, 4);
    scene.textures.addCanvas('furniture_desk', deskCanvas);

    // Office Chair (16x16)
    const chairCanvas = document.createElement('canvas');
    chairCanvas.width = 16;
    chairCanvas.height = 16;
    const chCtx = chairCanvas.getContext('2d')!;
    chCtx.fillStyle = '#393f50';
    chCtx.fillRect(3, 2, 10, 6); // backrest
    chCtx.fillStyle = '#4f586d';
    chCtx.fillRect(4, 8, 8, 5); // seat
    chCtx.fillStyle = '#222';
    chCtx.fillRect(7, 13, 2, 3); // base
    scene.textures.addCanvas('furniture_chair', chairCanvas);

    // Bookshelf (32x40)
    const shelfCanvas = document.createElement('canvas');
    shelfCanvas.width = 32;
    shelfCanvas.height = 40;
    const sCtx = shelfCanvas.getContext('2d')!;
    sCtx.fillStyle = '#4f331f';
    sCtx.fillRect(0, 0, 32, 40);
    sCtx.fillStyle = '#68452b';
    sCtx.fillRect(2, 2, 28, 36);
    // Shelves
    sCtx.fillStyle = '#3b2515';
    sCtx.fillRect(2, 14, 28, 2);
    sCtx.fillRect(2, 27, 28, 2);
    // Books on shelves
    const bookColors = ['#d95763', '#38bdf8', '#ffb300', '#4ade80', '#e06f8b', '#a2dcc7'];
    let bx = 4;
    for (let i = 0; i < 5; i++) {
      sCtx.fillStyle = bookColors[i % bookColors.length];
      sCtx.fillRect(bx, 4, 3, 10);
      bx += 4;
    }
    bx = 5;
    for (let i = 0; i < 4; i++) {
      sCtx.fillStyle = bookColors[(i + 3) % bookColors.length];
      sCtx.fillRect(bx, 17, 4, 10);
      bx += 5;
    }
    // Crystal or trinket on bottom shelf
    sCtx.fillStyle = '#e8d5b5';
    sCtx.fillRect(6, 30, 6, 7);
    sCtx.fillStyle = '#9b5de5';
    sCtx.fillRect(18, 31, 5, 6);
    scene.textures.addCanvas('furniture_bookshelf', shelfCanvas);

    // Wardrobe (28x44)
    const wardCanvas = document.createElement('canvas');
    wardCanvas.width = 28;
    wardCanvas.height = 44;
    const wCtx = wardCanvas.getContext('2d')!;
    wCtx.fillStyle = '#422a1b';
    wCtx.fillRect(0, 0, 28, 44);
    wCtx.fillStyle = '#5c3a26';
    wCtx.fillRect(2, 2, 11, 38);
    wCtx.fillRect(15, 2, 11, 38);
    // Brass Handles
    wCtx.fillStyle = '#e6af2e';
    wCtx.fillRect(10, 20, 2, 4);
    wCtx.fillRect(16, 20, 2, 4);
    scene.textures.addCanvas('furniture_wardrobe', wardCanvas);

    // Potted Plant (16x24)
    const plantCanvas = document.createElement('canvas');
    plantCanvas.width = 16;
    plantCanvas.height = 24;
    const pCtx = plantCanvas.getContext('2d')!;
    // Terracotta pot
    pCtx.fillStyle = '#c75d38';
    pCtx.fillRect(3, 14, 10, 9);
    pCtx.fillStyle = '#de734d';
    pCtx.fillRect(2, 13, 12, 3);
    // Green leaves
    pCtx.fillStyle = '#2d6a4f';
    pCtx.beginPath();
    pCtx.arc(8, 8, 6, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.fillStyle = '#52b788';
    pCtx.beginPath();
    pCtx.arc(6, 7, 3, 0, Math.PI * 2);
    pCtx.arc(10, 6, 3, 0, Math.PI * 2);
    pCtx.fill();
    scene.textures.addCanvas('furniture_plant', plantCanvas);

    // Night Window (32x32) with moon, stars and curtains
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 32;
    winCanvas.height = 32;
    const winCtx = winCanvas.getContext('2d')!;
    // Window frame
    winCtx.fillStyle = '#593a28';
    winCtx.fillRect(0, 0, 32, 32);
    // Deep night sky
    winCtx.fillStyle = '#0f172a';
    winCtx.fillRect(2, 2, 28, 28);
    // Moon
    winCtx.fillStyle = '#fef08a';
    winCtx.beginPath();
    winCtx.arc(20, 10, 4, 0, Math.PI * 2);
    winCtx.fill();
    // Stars
    winCtx.fillStyle = '#ffffff';
    winCtx.fillRect(6, 7, 1, 1);
    winCtx.fillRect(12, 14, 1, 1);
    winCtx.fillRect(24, 20, 1, 1);
    // Window mullions (crossbars)
    winCtx.fillStyle = '#593a28';
    winCtx.fillRect(15, 2, 2, 28);
    winCtx.fillRect(2, 15, 28, 2);
    // Cozy warm curtains
    winCtx.fillStyle = '#b91c1c';
    winCtx.fillRect(2, 2, 4, 28);
    winCtx.fillRect(26, 2, 4, 28);
    scene.textures.addCanvas('furniture_window', winCanvas);

    // Bedside Lamp / Nightstand (16x24)
    const lampCanvas = document.createElement('canvas');
    lampCanvas.width = 16;
    lampCanvas.height = 24;
    const lCtx = lampCanvas.getContext('2d')!;
    // Table
    lCtx.fillStyle = '#593a28';
    lCtx.fillRect(2, 14, 12, 10);
    lCtx.fillStyle = '#7a4f37';
    lCtx.fillRect(1, 13, 14, 2);
    // Lamp base
    lCtx.fillStyle = '#e6af2e';
    lCtx.fillRect(7, 8, 2, 6);
    // Lampshade (glowing amber)
    lCtx.fillStyle = '#fde047';
    lCtx.fillRect(4, 3, 8, 6);
    lCtx.fillStyle = '#ffffff';
    lCtx.fillRect(6, 4, 4, 2);
    scene.textures.addCanvas('furniture_lamp', lampCanvas);
  }

  private static createParticleTextures(scene: Phaser.Scene): void {
    // Light glow radial gradient
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const gCtx = glowCanvas.getContext('2d')!;
    const grad = gCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 230, 150, 0.4)');
    grad.addColorStop(0.5, 'rgba(255, 200, 100, 0.15)');
    grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    gCtx.fillStyle = grad;
    gCtx.fillRect(0, 0, 64, 64);
    scene.textures.addCanvas('lamp_glow', glowCanvas);
  }
}
