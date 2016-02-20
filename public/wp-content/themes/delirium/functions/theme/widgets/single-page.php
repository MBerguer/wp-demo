<?php

/*------------------------------------------*/
/* WPZOOM: Single Page                      */
/*------------------------------------------*/

class Wpzoom_Single_Page extends WP_Widget {

	/* Widget setup. */
	function Wpzoom_Single_Page() {
		/* Widget settings. */
		$widget_ops = array( 'classname' => 'wpzoom-singlepage', 'description' => __('Custom WPZOOM widget that displays a single specified static page.', 'wpzoom') );

		/* Widget control settings. */
		$control_ops = array( 'id_base' => 'wpzoom-single-page' );

		/* Create the widget. */
		$this->WP_Widget( 'wpzoom-single-page', __('WPZOOM: Single Page', 'wpzoom'), $widget_ops, $control_ops );
	}

	/* How to display the widget on the screen. */
	function widget( $args, $instance ) {
		extract( $args );

		/* Our variables from the widget settings. */
		$page_id = (int) $instance['page_id'];
		if ( empty( $page_id ) || $page_id < 1 ) return false;
		$page_data = get_page( $page_id );
		$title = apply_filters( 'widget_title', trim($page_data->post_title), $instance, $this->id_base );
		$link_title = (bool) $instance['link_title'];

		if ( !empty( $page_data->post_content ) ) {
			echo $before_widget;

			get_the_image( array( 'post_id' => $page_data->ID, 'size' => 'featured-cat', 'width' => 310, 'height' => 220, 'before' => '<div class="post-thumb">', 'after' => '</div>' ) );

			if ( $title ) {
				echo $before_title;
				if ( $link_title ) echo '<a href="' . esc_url( get_permalink($page_data->ID) ) . '">';
				echo $title;
				if ( $link_title ) echo '</a>';
				echo $after_title;
			}

			echo apply_filters( 'the_excerpt', trim($page_data->post_excerpt) );

			echo $after_widget;
		}
	}

		/* Update the widget settings.*/
		function update( $new_instance, $old_instance ) {
			$instance = $old_instance;

			/* Strip tags for title and name to remove HTML (important for text inputs). */
			$instance['page_id'] = (int) $new_instance['page_id'];
			$instance['link_title'] = $new_instance['link_title'];

			return $instance;
		}

		/** Displays the widget settings controls on the widget panel.
		 * Make use of the get_field_id() and get_field_name() function when creating your form elements. This handles the confusing stuff. */
		function form( $instance ) {
			/* Set up some default widget settings. */
			$defaults = array( 'page_id' => 0, 'link_title' => true );
			$instance = wp_parse_args( (array) $instance, $defaults );

			?><p>
				<label for="<?php echo $this->get_field_id('page_id'); ?>"><?php _e('Page to Display:', 'wpzoom'); ?></label>
				<?php wp_dropdown_pages( array( 'name' => $this->get_field_name('page_id'), 'id' => $this->get_field_id('page_id'), 'selected' => (int) $instance['page_id'] ) ); ?>
			</p>

			<p>
				<input class="checkbox" type="checkbox" <?php checked( $instance['link_title'], 'on' ); ?> id="<?php echo $this->get_field_id( 'link_title' ); ?>" name="<?php echo $this->get_field_name( 'link_title' ); ?>" />
				<label for="<?php echo $this->get_field_id( 'link_title' ); ?>"><?php _e('Link Page Title to Page', 'wpzoom'); ?></label>
			</p>

			<p class="description">This widget displays the <strong>Page Excerpt</strong>, so make sure to add one to the selected page</p>
			<?php
		}
}

function wpzoom_register_sp_widget() {
	register_widget('Wpzoom_Single_Page');
}
add_action('widgets_init', 'wpzoom_register_sp_widget');
?>