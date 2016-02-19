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

/* Homepage Slider */
add_image_size( 'featured', 600, 320, true );

/* Homepage Slider Nav */
add_image_size( 'featured-nav', 105, 75, true );

/* Homepage Carousel */
add_image_size( 'carousel', 300, 200, true );

/* Recent Posts Widget */
add_image_size( 'recent-widget', 75, 50, true );

/* Main loop */
add_image_size( 'loop', option::get('thumb_width'), option::get('thumb_height'), true );

/* Individual Post Thumbnail */

add_image_size( 'post-regular-fixed', 638, option::get('post_thumb_height'), true );
add_image_size( 'post-full-fixed', 980, option::get('post_thumb_height'), true );

add_image_size( 'post-regular', 638);
add_image_size( 'post-full', 980);

/* Single Post Page Related Posts */
add_image_size( 'post-related', 140, 130, true );


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
	return (int) option::get("excerpt_length") ? (int) option::get("excerpt_length") : 35;
}
add_filter('excerpt_length', 'new_excerpt_length');



/*  Maximum width for images in posts
=========================================== */

if ( ! isset( $content_width ) ) $content_width = 570;


/* Show all thumbnails in attachment.php
=========================================== */

function show_all_thumbs() {
	global $post;

	$post = get_post($post);
	$images =& get_children( 'post_type=attachment&post_mime_type=image&output=ARRAY_N&orderby=menu_order&order=ASC&post_parent='.$post->post_parent);
	if($images){
        $thumblist = '';
		foreach( $images as $imageID => $imagePost ){
			if($imageID==$post->ID){

			unset($the_b_img);
			$the_b_img = wp_get_attachment_image($imageID, 'thumbnail', false);
                $thumblist .= '<a class="active" href="'.get_attachment_link($imageID).'">'.$the_b_img.'</a>';


			} else {
			unset($the_b_img);
			$the_b_img = wp_get_attachment_image($imageID, 'thumbnail', false);
			$thumblist .= '<a href="'.get_attachment_link($imageID).'">'.$the_b_img.'</a>';
			}
		}
	}
	return $thumblist;
}


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


/* Comments Custom Template
==================================== */

function wpzoom_comment( $comment, $args, $depth ) {
	$GLOBALS['comment'] = $comment;
	switch ( $comment->comment_type ) :
		case '' :
	?>
	<li <?php comment_class(); ?> id="li-comment-<?php comment_ID(); ?>">
	<div id="comment-<?php comment_ID(); ?>">
		<?php if ( $comment->comment_approved == '0' ) : ?>
			<em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.', 'wpzoom' ); ?></em>
			<br />
		<?php endif; ?>

		<div class="comment-author vcard">
			<?php echo get_avatar( $comment, 48 ); ?>
			<?php printf( __( '%s <span class="says">says:</span>', 'wpzoom' ), sprintf( '<cite class="fn">%s</cite>', get_comment_author_link() ) ); ?>

			<div class="comment-meta commentmetadata"><a href="<?php echo esc_url( get_comment_link( $comment->comment_ID ) ); ?>">
				<?php printf( __('%s at %s', 'wpzoom'), get_comment_date(), get_comment_time()); ?></a><?php edit_comment_link( __( '(Edit)', 'wpzoom' ), ' ' );
				?>

			</div><!-- .comment-meta .commentmetadata -->

		</div><!-- .comment-author .vcard -->

		<div class="comment-body"><?php comment_text(); ?></div>

 		<div class="reply">
			<?php comment_reply_link( array_merge( $args, array( 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
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


/* Display custom post fields
==================================== */

function display_fields() {
	echo get_fields();
}

function get_fields() {
	global $post;

	$options = array();
	foreach ( option::$options as $option => $val ) {
		if ( preg_match( '#additional_([1-9][0-9]*)_label#i', $option, $matches ) && trim($val) != '' ) {
			$number = $matches[1];
			$options[$number] = trim($val);
		}
	}

	$out = '';
	foreach ( $options as $option => $val ) {
		$id = $option;
		$value = get_post_meta( $post->ID, 'wpzoom_additional_' . $id, true );
		$icon = isset(option::$options["additional_{$id}_icon"]) ? option::$options["additional_{$id}_icon"] : '';
		$img = trim($icon) != '' ? '<img src="' . $icon . '"  /> ' : '';

		// skip if we don't have value for this field
		if ( trim($value) === '' ) continue;

		$out .= '<p><strong>' . $img . $val . ':</strong> ' . $value . '</p>';
	}

	return $out;
}


/* Register custom shortcodes
==================================== */

function wpz_shortcode_ingredients( $atts, $content = null ) {
	extract( shortcode_atts( array(
      'title' => __( 'Ingredients', 'wpzoom' ),
    ), $atts ) );

	return '<div class="shortcode-ingredients"><h3>' . esc_attr($title) . '</h3>' . do_shortcode( $content ) . '</div>' . "\n";
}
add_shortcode( 'ingredients', 'wpz_shortcode_ingredients' );

function wpz_shortcode_directions( $atts, $content = null ) {
	extract( shortcode_atts( array(
      'title' => __( 'Directions', 'wpzoom' ),
    ), $atts ) );

	return '<div class="shortcode-directions instructions"><h3>' . esc_attr($title) . '</h3>' . do_shortcode( $content ) . '</div>' . "\n";
}
add_shortcode( 'directions', 'wpz_shortcode_directions' );

function add_recipe_buttons() {
	if ( !current_user_can('edit_posts') && ! current_user_can('edit_pages') ) {
		return;
	}

	if ( get_user_option('rich_editing') == 'true' ) {
		add_filter( 'mce_external_plugins', 'add_recipe_tinymce_plugin' );
		add_filter( 'mce_buttons', 'register_recipe_buttons' );
	}
}
add_action( 'init', 'add_recipe_buttons' );

function register_recipe_buttons( $buttons ) {
	array_push( $buttons, "|", "ingredients", "directions" );
	return $buttons;
}
function add_recipe_tinymce_plugin( $plugin_array ) {
	$plugin_array['recipe'] = get_template_directory_uri() . '/functions/theme/assets/js/recipe_buttons.js';
	return $plugin_array;
}

function recipe_refresh_mce( $ver ) {
	$ver += 3;
	return $ver;
}
add_filter( 'tiny_mce_version', 'recipe_refresh_mce' );

function recipe_enqueue_scripts() {
	wp_localize_script(
		'jquery',
		'wpzRecipeL10n',
		array(
			'titleIngredients' => __( 'WPZOOM Recipe Ingredients Shortcode', 'wpzoom' ),
			'titleDirections' => __( 'WPZOOM Recipe Directions Shortcode', 'wpzoom' ),
			'listItemsHere' => __( 'Place your list items here', 'wpzoom' )
		)
	);
}
add_action( 'admin_enqueue_scripts', 'recipe_enqueue_scripts' );



/* Setup the WP Favorite Posts plugin when it is activated
============================================================== */

add_action('activate_wp-favorite-posts/wp-favorite-posts.php', 'wpzoom_on_wpfp_init', 100);
function wpzoom_on_wpfp_init() {
	$options = (array) get_option( 'wpfp_options', array() );

	$options['add_favorite'] = __('Bookmark', 'wpzoom');
	$options['added'] = 'show remove link';
	$options['remove_favorite'] = __('Unbookmark', 'wpzoom');
	$options['removed'] = 'show add link';
	$options['before_image'] = '';

	update_option( 'wpfp_options', $options );
}