startGame = function() {
console.log('loaded')
var game = new Phaser.Game(1024, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var map;

function preload() {

    game.load.audio('lose', 'assets/lose.mp3')
    game.load.audio('win', 'assets/win.mp3')
    game.load.audio('pickup', 'assets/pickup_gold.mp3')
    game.load.audio('background', 'assets/waterworks.ogg')
    game.load.audio('walking', 'assets/footsteps/Footstep_Dirt_00.mp3' )
    game.load.audio('deathGrowl', 'assets/deathe.wav')
    game.load.audio('jump', 'assets/jump.mp3')
    game.load.audio('smash', 'assets/smash.mp3')
    game.load.image('jungle', 'assets/jungle_background.png', 1024, 600);
    game.load.image('star', 'assets/diamond.png');
    game.load.image('fireball', 'assets/bullet.png', 5, 5);
    game.load.tilemap('level1', 'assets/game_background.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('gameTiles', 'assets/tiles_spritesheet.png')
    game.load.spritesheet('knight', 'assets/dwarves.png', 100, 80);
    game.load.spritesheet('dude', 'assets/dwarves.png', 100, 80);
    game.load.spritesheet('boss', 'assets/dwarves.png', 100, 80)
    game.load.spritesheet('explosion', 'assets/explosion.png')

// game.load.spritesheet('', '')
}

var pickup;
var knights;
var knight;
var player;
var cursors;
var score = 0;
var scoreText;
var fireballTime = 0;
var fireballs;
var fireball;
var music;
var lose;
var walking;
var growl;
var jump;
var smash;
var boss;
var win;
var timeCheck;



function create() {

    music = game.add.audio('background')
    music.play();
    music.loop = true;
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0,0,6024,600, 'jungle')
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles_spritesheet', 'gameTiles');
    collisionLayer = map.createLayer('collision_layer');
    map.setCollisionBetween(0, 100000, true, collisionLayer);
    collisionLayer.resizeWorld()
    
    // The player and its settings
    player = game.add.sprite(100, 300, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    player.enableBody = true;
    // game.camera.follow(player)
    player.body.setSize(60,50,0,0)
    player.anchor.setTo(.5,1)

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [104, 105, 106, 107, 108, 109], 10, true);
    player.animations.add('right', [104, 105, 106, 107, 108, 109], 10, true);
    player.animations.add('idle', [100,101,102,103], 10, true);
    player.animations.add('jump',[111], 10, true);
    player.animations.add('attack', [111,112,113,114], 10, true);
    player.animations.add('death', [115,116], 10, false, true)

    boss = game.add.sprite(3500, 400, 'boss');
    game.physics.arcade.enable(boss)
    boss.enableBody = true;
    boss.body.setSize(30,30,0,0)
    boss.anchor.setTo(.5,1)
    boss.scale.x = 2
    boss.scale.y = 2
    boss.body.bounce.setTo = (1,0);
    boss.body.gravity.y = 500;
    boss.body.collideWorldBounds = true;
    boss.animations.add('boss_walk', [224,225,226,227,228,229], 7, true);
    boss.animations.add('boss_attack', [231,232,233,234], 10, true);
    boss.animations.play('boss_walk')
    boss.body.velocity.x =5

    smash = game.add.audio('smash')
    win = game.add.audio('win');
    growl = game.add.audio('deathGrowl')
    timer = game.time.create(true);





    knights = game.add.group();
    game.physics.arcade.enable(knights);
    knights.enableBody = true;
    createKnight();

    fireballs = game.add.group();
    game.physics.arcade.enable(fireballs)
    fireballs.enableBody = true;
    // knights.forEach(function(){
    createFireball()
    // }, this)

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    //fucking stars yo
    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 1000, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 100;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
    scoreText = game.add.text(game.camera.x,game.camera.y, "Score: 0", {
        font: "24px Arial",
        fill: "#ff0044",
        align: "center"
    });
    
};

    createKnight = function() {
    for (var i =0; i < 25; i++) {
    knight = knights.create(i * 300, 100, 'knight');
    knight.body.collideWorldBounds = true;
    knight.body.setSize(20,10,0,0)
    knight.body.immovable = true;
    //  knight physics properties. Give the little guy a slight bounce.
    knight.body.gravity.y = 500;
    knight.body.bounce.y = 0.2;
    // game.physics.arcade.collide(knight, collisionLayer);
    knight.animations.add('walk',[4,5,6,7,8,9], 10, true);
    knight.animations.play('walk', 5, true)
    // knight.animations.add('enemy_death', [15,16], 10)
    
    }
  }
    var knight_speed = 5;

    function followPlayer() {
      if(player.body.x < knight.body.x) {
        knight.body.velocity.x = knight_speed * -2.5;
        knight.anchor.setTo(.5,1)
        knight.scale.x = 1

      } else {
        knight.body.velocity.x = knight_speed * 2.5;
        knight.anchor.setTo(.5,1)
        knight.scale.x = -1
       } 

    };
    function createFireball() {
 
    fireballs.createMultiple(30, 'fireball')
    fireballs.setAll("scale.x", 0.7);
    fireballs.setAll("scale.y", 0.7);
    fireballs.setAll('anchor.x', 0.5);
    fireballs.setAll('anchor.y', 1);
    fireballs.setAll('outOfBoundsKill', true);
    fireballs.setAll('checkWorldBounds', true);
  }
    
    function launchFireball() {
    //  To avoid them being allowed to fire too fast we set a time limit
    knights.forEach(function(knight) {

    if (game.time.now > fireballTime) {
        //  Grab the first fireball we can from the pool
        fireball = fireballs.getFirstExists(false);
        if (fireball) {
            //  And fire it
            fireball.reset(knight.x + 30, knight.y - 30);
            fireball.body.velocity.x = 100;
            fireballTime = game.time.now + 500;
        }
    }
    }, this)
}

function attack() {
        knight.animations.add('enemy_attack', [10, 11,12,13], 10)
        knight.animations.play('enemy_attack', 10, false)
  
}
function kill() {
    knights.forEach(function(knight) {

    if (game.physics.arcade.distanceBetween(player, knight) < 70) {
    growl.play('', 0, 1, false, false)
    knight.animations.add('enemy_death', [14,15], 10)
    knight.animations.play('enemy_death', 10, false, true)
    score += 10;
    scoreText.text = 'Score: ' + score;
    }
  }, this)
  
}
function killBoss() {
  if (game.physics.arcade.distanceBetween(player, boss) < 100) {
    boss.animations.add('boss_death', [234,235], 10)
    boss.animations.play('boss_death', 10, false, true)
    score += 10;
    scoreText.text = 'Score: ' + score;
      music.stop()
    win.play('', 0 , 1 , false, false)
    var winText = game.add.text(game.camera.width / 2, game.camera.height / 2, "Score: 0", {
        font: "48px Arial",
        fill: "#ff0044",
        align: "left"
    });
    winText.fixedToCamera = true;
    winText.setText("YOU WIN");
    timeCheck = game.time.now;


    }
}


  function die(player, knight) {
  player.kill()
  music.stop()
  lose = game.add.audio('lose')
  lose.play()

  
   var dieText = this.game.add.text(game.camera.width / 2, game.camera.height / 2, "Score: 0", {
        font: "48px Arial",
        fill: "#ff0044",
        align: "left"
    });
    dieText.fixedToCamera = true;
    dieText.setText("YOU DIED");
    timeCheck = game.time.now;
    
  }  
function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, collisionLayer);
    game.physics.arcade.collide(knights, collisionLayer);
    game.physics.arcade.collide(boss, collisionLayer);
    game.physics.arcade.collide(stars, collisionLayer);
    game.physics.arcade.collide(player, boss, die, null, this);
    game.physics.arcade.collide(player, knights, die, null, this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    // knight.body.velocity.x = 0
    game.camera.follow(player)
    scoreText.x = game.camera.x;
    scoreText.y = game.camera.y;

    if (game.time.now - timeCheck > 4500) {

    sendScore(score)
    game.destroy();
}

    knights.forEach(function(knight) {

    if (game.physics.arcade.distanceBetween(player, knight) < 70) {
      attack()
      } 
    }, this)

    knights.forEach(function(knight) {
      var knight_speed = 5;
      if(player.body.x < knight.body.x) {
        knight.body.velocity.x = knight_speed * -2.5;
        knight.anchor.setTo(.5,1)
        knight.scale.x = 1

      } else {
        knight.body.velocity.x = knight_speed * 2.5;
        knight.anchor.setTo(.5,1)
        knight.scale.x = -1
       } 
    })

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
         player.anchor.setTo(.5, 1); //so it flips around its middle
          player.scale.x = 1; //facing default direction
        player.animations.play('left');
        // walking = game.add.audio('walking');
        // walking.play('', 0, 1, false, false);

        facing = 'left'
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
         player.anchor.setTo(.5, 1); //so it flips around its middle
        player.scale.x = -1; //flipped
        player.animations.play('right');
        // walking = game.add.audio('walking',1, false);
        // walking.play();
        facing = 'right';
    }
    else if (cursors.up.isDown) {
      player.animations.play('jump');
    }
    else if (cursors.down.isDown)  {
      player.animations.play('attack')
      smash.play('', 0, 1, false, false)
      kill()
      killBoss()

    }
    else
    {
        //  Stand still
        player.animations.play('idle');
    }



    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.velocity.y = -350;
        jump = game.add.audio('jump', 1)
        jump.play()
    }
    function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();
    pickup = game.add.audio('pickup');
    pickup.play();
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;



  }
    


}



}






