<?php 
/*-----------------------------------------------------------------------------------*/
/* Initializing Widgetized Areas (Sidebars)                                          */
/*-----------------------------------------------------------------------------------*/


/*----------------------------------*/
/* Sidebar                          */
/*----------------------------------*/

register_sidebar( array(
	'name' => 'Sidebar',
	'id' => 'sidebar',
	'before_widget' => '<div class="widget %2$s" id="%1$s">',
	'after_widget' => '<div class="cleaner">&nbsp;</div></div>',
	'before_title' => '<h3 class="title">',
	'after_title' => '</h3>',
) );


/*----------------------------------*/
/* Footer widgetized areas          */
/*----------------------------------*/

register_sidebar( array(
	'name' => 'Footer: Column 1',
	'id' => 'footer_1',
 	'before_widget' => '<div class="widget %2$s" id="%1$s">',
	'after_widget' => '<div class="cleaner">&nbsp;</div></div>',
	'before_title' => '<h3 class="title">',
	'after_title' => '</h3>',
) );

register_sidebar( array(
	'name' => 'Footer: Column 2',
	'id' => 'footer_2',
 	'before_widget' => '<div class="widget %2$s" id="%1$s">',
	'after_widget' => '<div class="cleaner">&nbsp;</div></div>',
	'before_title' => '<h3 class="title">',
	'after_title' => '</h3>',
) );

register_sidebar( array(
	'name' => 'Footer: Column 3',
	'id' => 'footer_3',
 	'before_widget' => '<div class="widget %2$s" id="%1$s">',
	'after_widget' => '<div class="cleaner">&nbsp;</div></div>',
	'before_title' => '<h3 class="title">',
	'after_title' => '</h3>',
) );

?>