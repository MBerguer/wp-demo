<?php 
/*-----------------------------------------------------------------------------------*/
/* Initializing Widgetized Areas (Sidebars)											 */
/*-----------------------------------------------------------------------------------*/
 
 
/*----------------------------------*/
/* Sidebar							*/
/*----------------------------------*/
 
register_sidebar(array(
    'name'=>'Sidebar',
    'id' => 'sidebar',
    'before_widget' => '<div id="%1$s" class="widget %2$s">',
    'after_widget' => '<div class="clear"></div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));


/*----------------------------------*/
/* Homepage							*/
/*----------------------------------*/
 

register_sidebar(array(
    'name'=>'Homepage (column 1)',
    'id' => 'home-1',
    'description' => 'Widget area for: "WPZOOM: Featured Category" or "WPZOOM: Single Page" widgets.',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear">&nbsp;</div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));

register_sidebar(array(
    'name'=>'Homepage (column 2)',
    'id' => 'home-2',
    'description' => 'Widget area for: "WPZOOM: Featured Category" or "WPZOOM: Single Page" widgets.',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear">&nbsp;</div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));

register_sidebar(array(
    'name'=>'Homepage (column 3)',
    'id' => 'home-3',
    'description' => 'Widget area for: "WPZOOM: Featured Category" or "WPZOOM: Single Page" widgets.',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear">&nbsp;</div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));

 

/*----------------------------------*/
/* Footer widgetized areas			*/
/*----------------------------------*/
 
register_sidebar(array(
    'name'=>'Footer (column 1)',
    'id' => 'footer_1',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear"></div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));

register_sidebar(array(
    'name'=>'Footer (column 2)',
    'id' => 'footer_2',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear"></div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));

register_sidebar(array(
    'name'=>'Footer (column 3)',
    'id' => 'footer_3',
    'before_widget' => '<div class="widget %2$s" id="%1$s">',
    'after_widget' => '<div class="clear"></div></div>',
    'before_title' => '<h3 class="title">',
    'after_title' => '</h3>',
));
 
 
?>