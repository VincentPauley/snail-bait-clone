// setup polyfill for animation (in the case user's browser doesn't support requestAnimationFrame())
window.requestNextAnimationFrame =
    (function() {
        let originalWebkitRequestAnimationFrame = undefined,
            wrapper = undefined,
            callback = undefined,
            geckoVersion = 0,
            userAgent = navigator.userAgent,
            index = 0,
            self = this;

        // fix for chrome not passing time into the animate function
        if( window.webkitRequestAnimationFrame ) {

            // define wrapper
            wrapper = function( time ) {
                if( time === undefined ) {
                    time = +new Date();
                }
                self.callback(time);
            };

            // switch
            originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;

            window.webkitRequestAnimationFrame = function( callback, element ) {

                self.callback = callback;

                // browser calls wrapper, wrapper calls callback
                originalWebkitRequestAnimationFrame( wrapper, element );
            }
        }

        // fix Gecko 2.0 which restricts fps to 30/40 per second
        if( window.mozRequestAnimationFrame ) {

            index = userAgent.indexOf( 'rv:' );

            if( userAgent.indeOf( 'Gecko' ) != -1 ) {
                geckoVersion = userAgent.substr( index + 3, 3 );

                if( geckoVersion === '2.0' ) {

                    // clear out the mozilla animator, will fail back to to setInterval() instead
                    window.mozRequestAnimationFrame = undefined;
                }
            }
        }

        return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||

               function( callback, element ) {
                  let start,
                      finish;

                  window.setTimeout( function() {
                      start = +new Date();
                      callback( start );
                      finish = +new Date();

                      self.timeout = 1000/60 - (finish - start);
                  }, self.timeout );
               }
    }
  )
();

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
    },
    // debug displays
    debug: {
        frame_rate_indicator: document.getElementById( 'frame-rate-indicator' )
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


let platform_offset = 0,
    platform_velocity = 0,
    PLATFORM_VELOCITY_MULTIPLIER = 4.35;

/*
 * Function: set_platform_velocity
 *
 * Note: this could be a static variable at the moment, however once player movement is
 * incorporated into the game velocity of the platforms will need to react to changes
 * in direction, this function will expand in the future.
 *
 * Parameters: none
 *
 * Returns: VOID, updates globals
 */
function set_platform_velocity() {

    // platforms move 4.35 times as fast as the background
    platform_velocity = bg_velocity * PLATFORM_VELOCITY_MULTIPLIER;
}
/*
 * Function: set_platform_offset
 *
 * modifies the global for platform offset by the last frame rate's duration to accurately
 * supply the number to move platforms by.  This again applys the notion of:
 *
 * OBJECTS' VELOCITY * TIME SINCE LAST FRAME DRAWN = NEW OBJECT POSITION
 *
 * parameters: nonw
 *
 * Returns: VOID, updates globals
 */
function set_platform_offset() {

    platform_offset += platform_velocity * ( last_frame_duration ) / 1000;

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

    // TODO: understand this translation before and after objects are rendered?
    CONTEXT.translate( -platform_offset, 0 );

    platform_data.forEach( platform => platform.render() );

    CONTEXT.translate( platform_offset, 0 );
}
/*
 * Function: animate
 *
 * wrapper around the games draw() action and call to requestNextAnimationFrame(), this function
 * runs in a loop requested by requestNextAnimationFrame() when browser is ready for a frame.
 *
 * Parameters:
 *
 *    now (DATE OBJECT) -> varies from different browsers but provides current time
 *
 * Returns: VOID, passes control to: requestNextAnimationFrame()
 */
function animate( now ) {

    calculate_fps( now );

    draw( now ); // draw an animation frame
    requestNextAnimationFrame( animate ); // call this function continuously as browser is ready for frames
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

    // initial call for frame, kicks off continuous calls to the animate() function above
    requestNextAnimationFrame( animate );
}

let fps,
    background = new Image(),
    runnerImage = new Image(),
    last_animation_frame_time = 0,
    last_fps_indicator_refresh = 0,
    last_frame_duration = 0;
/*
 * Function: calculate_fps
 *
 * calculates the time since the last frame and translates that into frames/second, also
 * updates the display for framerate within the DOM once per second.
 *
 * Parameters:
 *
 *    now (DATE OBJECT) -> varies from different browsers but provides current time
 *
 * Returns: VOID, updates DOM indicator with FPS if necessary
 */
function calculate_fps( now ) {

    fps = 1 / ( now - last_animation_frame_time ) * 1000;

    // update the frame-rate display once per second, NOTE: ability to perform tasks at different frequency than animations
    if( now - last_fps_indicator_refresh > 1000 ) {

        last_fps_indicator_refresh = now;

        CONFIG.debug.frame_rate_indicator.innerHTML = `Frame Rate: ${ fps.toFixed( 0 ) }`;
    }

    last_frame_duration = now - last_animation_frame_time;

    last_animation_frame_time = now;
}
/*
 * Function: set_offsets
 *
 * wrapper function around the functions that calculate coordinate offsets for the
 * background and platforms in order to simulate motion.
 *
 * Parameters: none
 *
 * Returns: VOID, passes control to the distinct offset functions
 */
function set_offsets( now ) {
    set_background_offset(now);
    set_platform_offset();
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
function draw(now) {

    set_platform_velocity();
    set_offsets(now);

    draw_background();
    draw_platforms();
    draw_runner();
}

let BACKGROUND_VELOCITY = 45,
    bg_velocity = BACKGROUND_VELOCITY;

/*
 * Function: set_background_offset
 *
 * for the sake of scrolling the background, this function calculates how far the
 * background needs to shift based on the set bg_velocity and the time since the last
 * animation frame.  Accounts for the beginning and ends of bg image being reached.
 *
 * Parameters:
 *
 *    now (DATE OBJECT) -> varies from different browsers but provides current time
 *
 * Returns: VOID, updates globals
 */
function set_background_offset( now ) {
    /*
     * Deep Dive:
     *
     * you never want to have motion rely on the speed of your game's animation, that will result in
     * fluctuating/inconsistent motion.  However it is critical to have the time since the last animation
     * in order to move the game components by the proper distance.  In short, the "offset" you need
     * to move the object is equal to:
     *
     * OBJECTS' VELOCITY * TIME SINCE LAST FRAME DRAWN
     *
     * this results in the object moving the appropriate distance every time rather than varying based
     * on frame-rate.
     */
    background_offset += bg_velocity * ( last_frame_duration ) / 1000;

    if( background_offset < 0 || background_offset > background.width ) {
        background_offset = 0;
    }
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
let background_offset = 0; // constantly updated as frames are drawn.

function draw_background() {

    // draw the background twice, side-by-side for scrolling
    CONTEXT.translate( -background_offset, 0 );
    CONTEXT.drawImage( background, 0, 0 );

    CONTEXT.drawImage( background, background.width, 0 );
    CONTEXT.translate( background_offset, 0 );
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

    CONTEXT.globalAlpha  = 1;
    CONTEXT.drawImage( runnerImage, 50, 280 );
}

// start the game
initialize_images();
