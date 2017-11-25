// CANVAS SETUP
const CANVAS = document.getElementById( 'canvas' ),
      CONTEXT = CANVAS.getContext( '2d' );

// GAME CONSTANTS
const CONFIG = {
    // the platforms exist on 3 distinct levels of height, which are sotred here
    track_lines: {
        track_1: 323,
        track_2: 223,
        track_3: 123
    },
    // constant attributes about the platforms are stored here
    platforms: {
        height: 8,
        stroke_width: 2,
        stroke_style: 'blue'
    }
};

/*
 * constructor: Platform
 *
 * represents a platform that a player is able to jump on
 * within the game.  Basic geometry layed out here, prototypes
 * follow below.
 *
 * Parameters:
 *
 *    platformAttributes (OBJECT) -> containing all values used below
 *
 * Returns: INSTANCE of this class
 */
function Platform( platformAttributes ) {
    this.left = platformAttributes.left;
    this.width = platformAttributes.width;
    this.height = CONFIG.platforms.height;
    this.fillStyle = platformAttributes.fillStyle;
    this.opacity = platformAttributes.opacity;
    this.track = platformAttributes.track;
    this.pulsate = platformAttributes.pulsate;
}
/*
 * Platform method: render
 *
 * every platform needs a way to be drawn to the canvas, this method does just that
 *
 * Parameters: none
 *
 * Returns: VOID, draws platform to the canvas
 */
Platform.prototype.render = function() {

    CONTEXT.lineWidth = CONFIG.platforms.stroke_width;
    CONTEXT.strokeStyle = CONFIG.platforms.stroke_style;
    CONTEXT.fillStyle = this.fillStyle;
    CONTEXT.globalAlpha = this.opacity; // NOTE: use globalAlpha to control opacity instead of RGBA

    CONTEXT.strokeRect( this.left, this.find_platform_top(), this.width, this.height );
    CONTEXT.fillRect( this.left, this.find_platform_top(), this.width, this.height );
}
/*
 * Platform method: find_platform_top
 *
 * helper function to locate the tops of platforms onto one of the
 * three constant tracklines.  Trackline heights are currently stored as globals,
 * at the top of this file.
 *
 * Returns: INTERGER (track height) on success, throws error if needed
 */
Platform.prototype.find_platform_top = function() {
    switch( this.track ) {
        case 1:
            return CONFIG.track_lines.track_1;
            break;
        case 2:
            return CONFIG.track_lines.track_2;
            break;
        case 3:
            return CONFIG.track_lines.track_3;
            break;
        default:
            alert( `ERROR: calculate_platform_top: ${ track } is not valid parameter` );
            return;
    }
}

// stores locations of all platforms in the game
let platform_data = [];

// distinct attributes about each platform
// TODO: ideally this would come from distinct level files but its hard-coded for now
let platform_source_data = [
    {
        left: 10,
        width: 230,
        fillStyle: 'rgb( 250, 250, 0 )',
        opacity: 0.5,
        track: 1,
        pulsate: false
    },
    {
        left: 220,
        width: 140,
        fillStyle: 'rgb( 250, 250, 0 )',
        opacity: 0.5,
        track: 2,
        pulsate: false
    },
    {
        left: 320,
        width: 90,
        fillStyle: 'rgb( 250, 250, 0 )',
        opacity: 0.5,
        track: 3,
        pulsate: false
    },
    {
        left: 460,
        width: 190,
        fillStyle: 'rgb( 250, 250, 0 )',
        opacity: 0.5,
        track: 1,
        pulsate: false
    }
];

// create platform from the source
platform_source_data.forEach( platform => {
    platform_data.push(
        new Platform({
            left: platform.left,
            width: platform.width,
            fillStyle: platform.fillStyle,
            opacity: platform.opacity,
            track: platform.track,
            pulsate: platform.pulsate
        })
    );
});

let background = new Image(),
    runnerImage = new Image();

/*
 * Function: initialize_images
 *
 * configures the game images to use the resources available in /images and
 * calls the start_game function once images have been loaded in.
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function initialize_images() {

     background.src = '../images/jungle_game_background.png';
    runnerImage.src = '../images/samus.png';

    background.onload = function( e ) {
        start_game();
    };
}
/*
 * Function draw_platforms
 *
 * each platform within the game has it's own render method, this
 * function iterates all platforms and calls their render function.
 * result is all platforms being drawn into the canvas.
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function draw_platforms() {

    platform_data.forEach( platform => platform.render() );
}
/*
 * Function: start_game
 *
 * Calls all actions necessary for the game to run
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function start_game() {

    draw();
    draw_platforms();
}
/*
 * Function: draw
 *
 * calls all the individual drawing functions in the proper order so that the
 * layering works as expected.
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function draw() {
    draw_background();
    draw_runner();
}
/*
 * Function: draw_background
 *
 * renders the background image into the canvas
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function draw_background() {

    CONTEXT.drawImage( background, 0, 0 );
}
/*
 * Function: draw_runner
 *
 * renders the runner image into the canvas
 *
 * Parameters: none
 *
 * Returns: VOID
 */
function draw_runner() {

    CONTEXT.drawImage( runnerImage, 50, 280 );
}

// start the game
initialize_images();
