console.log('loaded')
var game = new Phaser.Game(1024, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var platforms;
var map;
var layers;


function preload() {

    game.load.image('jungle', 'assets/jungle_background.png', 1024, 600);
    game.load.image('star', 'assets/star.png');
    game.load.tilemap('level1', 'assets/game_background.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('gameTiles', 'assets/tiles_spritesheet.png')
    game.load.spritesheet('knight', 'assets/dwarves.png', 100, 80);
    game.load.spritesheet('dude', 'assets/dwarves.png', 100, 80);

}

var knight;
var player;
var cursors;
var score = 0;
var scoreText;


function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0,0,6024,600, 'jungle')
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles_spritesheet', 'gameTiles');
    collisionLayer = map.createLayer('collision_layer');
    map.setCollisionBetween(0, 100000, true, collisionLayer);
    collisionLayer.resizeWorld()
    
    // The player and its settings
    player = game.add.sprite(32, game.world.height - 200, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    // game.camera.follow(player)
    player.body.setSize(80,50,0,0)

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
    player.animations.add('death', [115,116], 10, true)

    knights = game.add.group();
    game.physics.arcade.enable(knights);
    knights.enableBody = true;
    createKnight();

  

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
    //  knight physics properties. Give the little guy a slight bounce.
    knight.body.gravity.y = 500;
    knight.body.bounce.y = 0.2;
    // game.physics.arcade.collide(knight, collisionLayer);
    knight.animations.add('walk',[4,5,6,7,8,9], 10, true);
    knight.animations.play('walk', 5, true)
    followPlayer()
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


  function die(player, knight) {
  player.kill()

  
   var dieText = this.game.add.text(game.camera.width / 2, game.camera.height / 2, "Score: 0", {
        font: "48px Arial",
        fill: "#ff0044",
        align: "left"
    });
    dieText.fixedToCamera = true;
    dieText.setText("YOU DIED");
  
}
  function attack(player, knight) {
    knight.kill();
    score += 10;
    scoreText.text = 'Score: ' + score;
  }

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, collisionLayer);
    game.physics.arcade.collide(knights, collisionLayer);
    game.physics.arcade.collide(stars, collisionLayer);
    game.physics.arcade.collide(player, knights, die, null, this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    // knight.body.velocity.x = 0
    game.camera.follow(player)
    scoreText.x = game.camera.x;
    scoreText.y = game.camera.y;
    


    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
         player.anchor.setTo(.5, 1); //so it flips around its middle
          player.scale.x = 1; //facing default direction
        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
         player.anchor.setTo(.5, 1); //so it flips around its middle
        player.scale.x = -1; //flipped
        player.animations.play('right');
    }
    else if (cursors.up.isDown) {
      player.animations.play('jump');
    }
    else if (cursors.down.isDown)  {
      player.animations.play('attack')
      player.body.setSize(150,80,0,0)
    }
    else
    {
        //  Stand still
        player.animations.play('idle');
    }

    // if(cursors.down.isDown && player.body.collidesWith(knight.body)) {
    //   attack()
    // }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.velocity.y = -350;
    }
    function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
    


}










