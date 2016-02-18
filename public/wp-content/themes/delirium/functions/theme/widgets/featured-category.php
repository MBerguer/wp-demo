<?php

/*------------------------------------------*/
/* WPZOOM: Featured Category widget			*/
/*------------------------------------------*/
 
class wpzoom_widget_category extends WP_Widget {

	/* Widget setup. */
	function wpzoom_widget_category() {
		/* Widget settings. */
		$widget_ops = array( 'classname' => 'wpzoom-featured-category', 'description' => __('Featured Category Widget for Homepage', 'wpzoom') );

		/* Widget control settings. */
		$control_ops = array( 'width' => 250, 'height' => 350, 'id_base' => 'wpzoom-widget-cat' );

		/* Create the widget. */
		$this->WP_Widget( 'wpzoom-widget-cat', __('WPZOOM: Featured Category', 'wpzoom'), $widget_ops, $control_ops );
	}

	/* How to display the widget on the screen. */
	function widget( $args, $instance ) {
		extract( $args );

		/* Our variables from the widget settings. */
		$title = apply_filters('widget_title', $instance['title'] );
  		$posts = $instance['posts'];
 		$category = $instance['category'];
		if ($category) {
		$categoryLink = get_category_link($category);
    }
		$exclude_featured = $instance['exclude_featured'];

		/* Exclude featured posts from Widget Posts */
		$postnotin = '';
		if ($exclude_featured == 'on') {
			
			$featured_posts = new WP_Query( 
				array( 
					'post__not_in' => get_option( 'sticky_posts' ),
					'posts_per_page' => option::get('featured_number'),
					'meta_key' => 'wpzoom_is_featured',
					'meta_value' => 1				
					) );
				
			while ($featured_posts->have_posts()) {
				$featured_posts->the_post();
				global $post;
				$postIDs[] = $post->ID;
			}
			$postnotin = $postIDs;
		}
    
 	echo $before_widget;
 	 
 	?>
 
		<?php $sq = new WP_Query( array( 'cat' => $category, 'showposts' => $posts, 'orderby' => 'date', 'post__not_in' => $postnotin, 'order' => 'DESC' ) ); ?>
			<?php if ( $sq->have_posts() ) : while( $sq->have_posts() ) : $sq->the_post();  global $post;   ?>

			<div class="featured-post">
 			  
				 
				<?php 

					if ( $title ) {

						$categoryOutput = '<h4 class="cat-link"><a href="'.$categoryLink.'">'.$title.'</a></h4>';

						} else {

						$categoryOutput = '';
					}

					get_the_image( array( 'size' => 'featured-cat', 'width' => 310, 'height' => 220, 'before' => '<div class="post-thumb">', 'after' => $categoryOutput.'</div>' ) ); ?> 

 				
				<h3 class="post-title"><a href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></h3>
			
				<div class="post-content">
					<?php the_excerpt(); ?>
 				</div>
				
				<div class="recent-meta">
 					<span><?php _e('by', 'wpzoom'); ?> <?php the_author_posts_link(); ?></span>
 					<span class="separator">&mdash;</span>
					<span><?php comments_popup_link( __('0 comments', 'wpzoom'), __('1 comment', 'wpzoom'), __('% comments', 'wpzoom'), '', __('Comments are Disabled', 'wpzoom')); ?></span>
					 
					<?php edit_post_link( __('Edit', 'wpzoom'), '<span>', '</span>'); ?>
				</div><!-- /.post-meta -->
			</div> <!-- /.featured-post -->
 			<?php endwhile; ?>
			
			<?php endif; ?>
		
  				
  			 
	<?php 
 		
	echo $after_widget; 
	wp_reset_query(); 
	}

	/* Update the widget settings.*/
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;

		/* Strip tags for title and name to remove HTML (important for text inputs). */
		$instance['title'] = strip_tags( $new_instance['title'] );
 		$instance['category'] = $new_instance['category'];
 		$instance['posts'] = $new_instance['posts'];
		$instance['exclude_featured'] = $new_instance['exclude_featured'];
 
		return $instance;
	}

	/** Displays the widget settings controls on the widget panel.
	 * Make use of the get_field_id() and get_field_name() function when creating your form elements. This handles the confusing stuff. */
	function form( $instance ) {

		/* Set up some default widget settings. */
		$defaults = array( 'title' => __('Category Name', 'wpzoom'), 'category' => '',  'posts' => '1', 'exclude_featured' => false );
		$instance = wp_parse_args( (array) $instance, $defaults );
     ?>

 		<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e('Category Title:', 'wpzoom'); ?></label>
			<input  type="text" class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo $instance['title']; ?>"   />
		</p>

	 
 		<p>
			<label for="<?php echo $this->get_field_id('category'); ?>"><?php _e('Category:', 'wpzoom'); ?></label>
			<select id="<?php echo $this->get_field_id('category'); ?>" name="<?php echo $this->get_field_name('category'); ?>" style="width:90%;">
				<option value="0">Choose category:</option>
				<?php
				$cats = get_categories('hide_empty=0');
				
				foreach ($cats as $cat) {
				$option = '<option value="'.$cat->term_id;
				if ($cat->term_id == $instance['category']) { $option .='" selected="selected';}
				$option .= '">';
				$option .= $cat->cat_name;
				$option .= ' ('.$cat->category_count.')';
				$option .= '</option>';
				echo $option;
				}
			?>
			</select>
		</p>
     
		<p>
			<label for="<?php echo $this->get_field_id('posts'); ?>"><?php _e('Posts to show:', 'wpzoom'); ?></label>
			<select id="<?php echo $this->get_field_id('posts'); ?>" name="<?php echo $this->get_field_name('posts'); ?>" style="width:90%;">
			<?php
				$m = 0;
				while ($m < 10) {
				$m++;
				$option = '<option value="'.$m;
				if ($m == $instance['posts']) { $option .='" selected="selected';}
				$option .= '">';
				$option .= $m;
				$option .= '</option>';
				echo $option;
				}
			?>
			</select>
		</p>

		<p>
			<input class="checkbox" type="checkbox" id="<?php echo $this->get_field_id('exclude_featured'); ?>" name="<?php echo $this->get_field_name('exclude_featured'); ?>" <?php if ($instance['exclude_featured'] == 'on') { echo ' checked="checked"';  } ?> /> 
			<label for="<?php echo $this->get_field_id('exclude_featured'); ?>"><?php _e('Exclude Featured Posts from Widget', 'wpzoom'); ?></label>
			<br/>
		</p>
		 
	<?php
	}
}

function wpzoom_register_category_widget() {
	register_widget('wpzoom_widget_category');
}
add_action('widgets_init', 'wpzoom_register_category_widget');
?>