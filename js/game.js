class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }
    
    preload() {
        // load your custom assets
        this.load.image('background', 'assets/images/sky.png');
        this.load.image('platform',   'assets/images/platform.png');
        this.load.image('star',       'assets/images/stars.png');
        this.load.image('bomb',       'assets/images/bombs.png');
        this.load.spritesheet('player',
            'assets/spritesheets/player_spritesheet.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        // background
        this.add.image(400, 300, 'background');

        // platforms (static)
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'platform');
        this.platforms.create( 50, 250, 'platform');
        this.platforms.create(700, 220, 'platform');
        // catch‐all floor at the bottom so stars/bombs never drop off-screen

/*
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        */
        
        // player setup
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'player', frame: 4 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10, repeat: -1
        });

        // inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        // groups
        this.stars = this.physics.add.group();
        this.bombs = this.physics.add.group();

        // initial stars
        for (let i = 0; i < 12; i++) {
            this.spawnStar();
        }

        // UI & state
        this.starsCollected = 0;
        this.gameOver = false;
        this.starsText = this.add
            .text(
                this.scale.width  - 16,   // place 16px from the right edge
                16,                        // 16px from the top
                'Stars Collected: 0',
                { fontSize: '24px', fill: '#ffffff' }
            )
            .setOrigin(1, 0);             // origin at top-right of the text


        // collisions & overlaps
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);


    }

    update() {
        if (this.gameOver) { return; }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-330);
        }

    }

    collectStar(player, star) {
        star.disableBody(true, true);

        this.starsCollected++;
        this.starsText.setText(`Stars Collected: ${this.starsCollected}`);

        // cycle through the 7 colors:
        const rainbow = [
        0xff0000, // red
        0xff7f00, // orange
        0xffff00, // yellow
        0x00ff00, // green
        0x0000ff, // blue
        0x4b0082, // indigo
        0x9400d3  // violet
        ];
        // apply the tint based on how many stars you’ve collected:
        this.player.setTint(rainbow[(this.starsCollected - 1) % rainbow.length]);

        this.spawnStar();

        if (this.starsCollected % 5 === 0) {
        this.player.setScale(this.player.scaleX * 1.1);
        this.spawnBomb();
        }
    }


    spawnStar() {
        const x = Phaser.Math.Between(0, this.scale.width);
        const star = this.stars.create(x, 0, 'star');
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setCollideWorldBounds(true);
    }

    spawnBomb() {
        const x = Phaser.Math.Between(0, this.scale.width);
        const bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(
            Phaser.Math.Between(-200, 200),
            Phaser.Math.Between(50, 150)
        );
        bomb.allowGravity = false;
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
        this.add.text(400, 300, 'Game Over', {
            fontSize: '48px',
            fill: '#f00'
        }).setOrigin(0.5);
    }
}

// game config
const config = {
    type: Phaser.AUTO,
    width:  800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    },
    scene: MainScene
};

// launch!
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
