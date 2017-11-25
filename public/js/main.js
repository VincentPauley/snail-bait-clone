const CANVAS = document.getElementById( 'canvas' ),
      CONTEXT = CANVAS.getContext( '2d' );

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
