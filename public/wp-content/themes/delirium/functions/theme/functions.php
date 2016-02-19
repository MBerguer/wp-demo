<?php

/*
 * Let WordPress manage the document title.
 * By adding theme support, we declare that this theme does not use a
 * hard-coded <title> tag in the document head, and expect WordPress to
 * provide it for us.
 */
add_theme_support( 'title-tag' );

/* Register Thumbnails Size
================================== */

if ( function_exists( 'add_image_size' ) ) {

	/* Homepage Slider */
  	add_image_size( 'featured', 1030, 520, true );

	/* Featured Category Widget */
    add_image_size( 'featured-cat', 310, 220, true );
    add_image_size( 'woo-featured', 230, 260, true );

	/* Main loop */
	add_image_size( 'loop', option::get('thumb_width'), option::get('thumb_height'), true );

}



/* 	WooCommerce Support
==================================== */

if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {

	add_theme_support( 'woocommerce' );

}

/*  WooCommerce Extra Features
 *
 * Change number of related products on product page
 * ==================================== */

function woo_related_products_limit() {
  global $product;

    $args = array(
        'post_type'             => 'product',
        'no_found_rows'         => 1,
        'posts_per_page'        => 4,
        'ignore_sticky_posts'   => 1,
        'orderby'               => $orderby,
        'post__in'              => $related,
        'post__not_in'          => array($product->id)
    );
    return $args;
}
add_filter( 'woocommerce_related_products_args', 'woo_related_products_limit' );


// Ensure cart contents update when products are added to the cart via AJAX (place the following in functions.php)
add_filter('add_to_cart_fragments', 'woocommerce_header_add_to_cart_fragment');

function woocommerce_header_add_to_cart_fragment( $fragments ) {
	global $woocommerce;

	ob_start();

	?>
	<a class="cart-contents" href="<?php echo $woocommerce->cart->get_cart_url(); ?>" title="<?php _e('View your shopping cart', 'wpzoom'); ?>"><?php echo sprintf(_n('%d item', '%d items', $woocommerce->cart->cart_contents_count, 'wpzoom'), $woocommerce->cart->cart_contents_count);?> - <?php echo $woocommerce->cart->get_cart_total(); ?></a>
	<?php

	$fragments['a.cart-contents'] = ob_get_clean();

	return $fragments;

}


/* Media Queries Stylesheet
==================================== */

function responsive_styles() {
    wp_enqueue_style( 'media-queries', get_template_directory_uri() . '/media-queries.css', array() );
}
add_action( 'wp_enqueue_scripts', 'responsive_styles' );



/* Video auto-thumbnail
==================================== */

if (is_admin()) {
    WPZOOM_Video_Thumb::init();
}


/* 	Register Custom Menu
==================================== */

register_nav_menu('primary', 'Main Menu');



/*  Add support for Custom Background
==================================== */

add_theme_support( 'custom-background' );



/*  Reset [gallery] shortcode styles
==================================== */

add_filter('gallery_style', create_function('$a', 'return "<div class=\'gallery\'>";'));



/*  Add Support for Shortcodes in Excerpt
========================================== */

add_filter( 'the_excerpt', 'shortcode_unautop');
add_filter( 'the_excerpt', 'do_shortcode');

add_filter( 'widget_text', 'shortcode_unautop');
add_filter( 'widget_text', 'do_shortcode');



/*  Custom Excerpt Length
==================================== */

function new_excerpt_length($length) {
	return (int) option::get("excerpt_length") ? (int) option::get("excerpt_length") : 50;
}
add_filter('excerpt_length', 'new_excerpt_length');



/*  Enable Excerpt Field for Pages
==================================== */

add_action( 'init', 'my_add_excerpts_to_pages' );
function my_add_excerpts_to_pages() {
     add_post_type_support( 'page', 'excerpt' );
}



/*  Maximum width for images in posts
=========================================== */

if ( ! isset( $content_width ) ) $content_width = 680;


/*  Limit Posts
/*
/*  Plugin URI: http://labitacora.net/comunBlog/limit-post.phps
/*	Usage: the_content_limit($max_charaters, $more_link)
===================================================== */

function the_content_limit($max_char, $more_link_text = '(more...)', $stripteaser = 0, $more_file = '', $echo = true) {
    $content = get_the_content($more_link_text, $stripteaser, $more_file);
    $content = apply_filters('the_content', $content);
    $content = str_replace(']]>', ']]&gt;', $content);
    $content = strip_tags($content);

   if (strlen($_GET['p']) > 0 && $thisshouldnotapply) {
      echo $content;
   }
   else if ((strlen($content)>$max_char) && ($espacio = strpos($content, " ", $max_char ))) {
        $content = substr($content, 0, $espacio);
        if ($echo == true) { echo $content . "..."; } else {return $content; }
   }
   else {
      if ($echo == true) { echo $content . "..."; } else {return $content; }
   }
}



/* Video Embed Code Fix
==================================== */

function embed_fix($video,$width,$height) {

  $video = preg_replace("/(width\s*=\s*[\"\'])[0-9]+([\"\'])/i", "$1 ".$width." $2", $video);
  $video = preg_replace("/(height\s*=\s*[\"\'])[0-9]+([\"\'])/i", "$1 ".$height." $2", $video);
  if (strpos($video, "<embed src=" ) !== false) {
      $video = str_replace('</param><embed', '</param><param name="wmode" value="transparent"></param><embed wmode="transparent" ', $video);
  }
  else {
    if(strpos($video, "wmode=transparent") == false){

      $re1='.*?'; # Non-greedy match on filler
      $re2='((?:\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s"]*))';  # HTTP URL 1

      if ($c=preg_match_all ("/".$re1.$re2."/is", $video, $matches))
      {
	$httpurl1=$matches[1][0];
      }

      if(strpos($httpurl1, "?") == true){
	$httpurl_new = $httpurl1 . '&wmode=transparent';
      }
      else {
	$httpurl_new = $httpurl1 . '?wmode=transparent';
      }

      $search = array($httpurl1);
      $replace = array($httpurl_new);
      $video = str_replace($search, $replace, $video);

      //print($httpurl_new);
      unset($httpurl_new);

    }
  }
  return $video;
}



/* Comments Custom Template
==================================== */

function wpzoom_comment( $comment, $args, $depth ) {
    $GLOBALS['comment'] = $comment;
    switch ( $comment->comment_type ) :
        case '' :
    ?>
    <li <?php comment_class(); ?> id="li-comment-<?php comment_ID(); ?>">
        <div id="comment-<?php comment_ID(); ?>">
        <div class="comment-author vcard">
            <?php echo get_avatar( $comment, 60 ); ?>
            <?php printf( __( '%s <span class="says">says:</span>', 'wpzoom' ), sprintf( '<cite class="fn">%s</cite>', get_comment_author_link() ) ); ?>

            <div class="comment-meta commentmetadata"><a href="<?php echo esc_url( get_comment_link( $comment->comment_ID ) ); ?>">
                <?php printf( __('on %s at %s', 'wpzoom'), get_comment_date(), get_comment_time()); ?></a><?php edit_comment_link( __( '(Edit)', 'wpzoom' ), ' ' );
                ?>

            </div><!-- .comment-meta .commentmetadata -->

        </div><!-- .comment-author .vcard -->
        <?php if ( $comment->comment_approved == '0' ) : ?>
            <em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.', 'wpzoom' ); ?></em>
            <br />
        <?php endif; ?>



        <div class="comment-body"><?php comment_text(); ?></div>

        <div class="reply">
      <?php $reply_img = '<img src="' . get_template_directory_uri() . '/images/quick-reply-button.png">'; ?>
            <?php comment_reply_link( array_merge( $args, array( 'depth' => $depth, 'max_depth' => $args['max_depth'], 'reply_text' => $reply_img ) ) ); ?>
        </div><!-- .reply -->
    </div><!-- #comment-##  -->

    <?php
            break;
        case 'pingback'  :
        case 'trackback' :
    ?>
    <li class="post pingback">
        <p><?php _e( 'Pingback:', 'wpzoom' ); ?> <?php comment_author_link(); ?><?php edit_comment_link( __( '(Edit)', 'wpzoom' ), ' ' ); ?></p>
    <?php
            break;
    endswitch;
}



/* Tabbed Widget
============================ */

function tabber_tabs_load_widget() {
    // Register widget.
    register_widget( 'WPZOOM_Widget_Tabber' );
}


/**
 * Temporarily hide the "tabber" class so it does not "flash"
 * on the page as plain HTML. After tabber runs, the class is changed
 * to "tabberlive" and it will appear.
 */
function tabber_tabs_temp_hide(){
    echo '<script type="text/javascript">document.write(\'<style type="text/css">.tabber{display:none;}</style>\');</script>';
}


// Function to check if there are widgets in the Tabber Tabs widget area
// Thanks to Themeshaper: http://themeshaper.com/collapsing-wordpress-widget-ready-areas-sidebars/
function is_tabber_tabs_area_active( $index ){
    global $wp_registered_sidebars;

    $widgetcolums = wp_get_sidebars_widgets();

    if ($widgetcolums[$index]) return true;

    return false;
}


 // Let's build a widget
class WPZOOM_Widget_Tabber extends WP_Widget {

    function WPZOOM_Widget_Tabber() {
        $widget_ops = array( 'classname' => 'tabbertabs', 'description' => __('Drag me to the Sidebar', 'wpzoom') );
        $control_ops = array( 'width' => 230, 'height' => 300, 'id_base' => 'wpzoom-tabber' );
        $this->WP_Widget( 'wpzoom-tabber', __('WPZOOM: Tabs', 'wpzoom'), $widget_ops, $control_ops );
    }

    function widget( $args, $instance ) {
        extract( $args );

        $style = $instance['style']; // get the widget style from settings

        echo "\n\t\t\t" . $before_widget;

	// Show the Tabs
	echo '<div class="tabber">'; // set the class with style
	  if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('tabber_tabs') )
	echo '</div>';
	echo '</div>';

	echo "\n\t\t\t" . $after_widget;
    }

    function update( $new_instance, $old_instance ) {
        $instance = $old_instance;
        $instance['style'] = $new_instance['style'];

        return $instance;
    }

    function form( $instance ) {

        //Defaults
        $defaults = array( 'title' => __('Tabber', 'wpzoom'), 'style' => 'style1' );
        $instance = wp_parse_args( (array) $instance, $defaults ); ?>

        <div style="float:left;width:98%;"></div>
	<p>
	<?php _e('Place your widgets in the <strong>WPZOOM: Tabs Widget Area</strong> and have them show up here.', 'wpzoom')?>
	</p>

	<div style="clear:both;">&nbsp;</div>
      <?php
    }
}

/* Tabber Tabs Widget */
tabber_tabs_plugin_init();

/* Initializes the plugin and it's features. */
function tabber_tabs_plugin_init() {

    // Loads and registers the new widget.
    add_action( 'widgets_init', 'tabber_tabs_load_widget' );

    //Registers the new widget area.
    register_sidebar(
        array(
        'name' => __('WPZOOM: Tabs Widget Area', 'wpzoom'),
        'id' => 'tabber_tabs',
        'description' => __('Build your tabbed area by placing widgets here.  !! DO NOT PLACE THE WPZOOM: TABS IN THIS AREA.', 'wpzoom'),
        'before_widget' => '<div id="%1$s" class="tabbertab %2$s">',
        'after_widget' => '<div class="clear"></div></div>'
	)
    );

    // Hide Tabber until page load
    add_action( 'wp_head', 'tabber_tabs_temp_hide' );

}



/* Register Custom Fields in Profile: Facebook, Twitter
===================================================== */

add_action( 'show_user_profile', 'my_show_extra_profile_fields' );
add_action( 'edit_user_profile', 'my_show_extra_profile_fields' );

function my_show_extra_profile_fields( $user ) { ?>

    <h3>Additional Profile Information</h3>

    <table class="form-table">


	<tr>
	    <th><label for="twitter">Twitter Username</label></th>

            <td>
                <input type="text" name="twitter" id="twitter" value="<?php echo esc_attr( get_the_author_meta( 'twitter', $user->ID ) ); ?>" class="regular-text" /><br />
                <span class="description">Please enter your Twitter username.</span>
	    </td>
	</tr>


    </table>
<?php }

add_action( 'personal_options_update', 'my_save_extra_profile_fields' );
add_action( 'edit_user_profile_update', 'my_save_extra_profile_fields' );

function my_save_extra_profile_fields( $user_id ) {

    if ( !current_user_can( 'edit_user', $user_id ) )
        return false;

	update_user_meta( $user_id, 'twitter', $_POST['twitter'] );
}



/* Register Custom Slider Scripts
===================================================== */

function carouFredSel_scripts() {
    if ( ! is_home() ) return;
    if ( get_query_var('paged') && get_query_var( 'paged' ) != 1 ) return;
    if ( ! option::is_on( 'featured_posts_show' ) ) return;

    $slider_config = array(
        'slideshow_speed' => intval( option::get( 'slideshow_speed' ) ),
        'autoplay' => option::is_on( 'slideshow_auto' )
    );

    if ( option::is_on( 'slideshow_auto' ) ) {
        wp_enqueue_script( 'frogaloop', 'http://a.vimeocdn.com/js/froogaloop2.min.js' );
        wp_enqueue_script( 'youtube-player-api', 'https://www.youtube.com/player_api' );
    }

    wp_enqueue_script( 'touchswipe', get_template_directory_uri() . '/js/jquery.touchSwipe.min.js', array( 'jquery' ), '1.6.5', true );
    wp_enqueue_script( 'caroufredsel', get_template_directory_uri() . '/js/jquery.carouFredSel.js', array( 'jquery' ), '6.2.1', true );
    wp_enqueue_script( 'featured-slider', get_template_directory_uri() . '/js/jquery.featuredSlider.js', array( 'touchswipe', 'caroufredsel' ), '20140127', true );

    wp_localize_script( 'featured-slider', 'featured_slider', json_encode( $slider_config ) );
}
add_action( 'wp_enqueue_scripts', 'carouFredSel_scripts' );
