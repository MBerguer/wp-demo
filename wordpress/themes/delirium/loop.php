<div id="recent-posts" class="clearfix list-view">
 
	<?php $i = 0; while (have_posts()) : the_post(); $i++; 
		$video = get_post_meta($post->ID, 'wpzoom_post_embed_code', true);  ?>
		
		<div id="post-<?php the_ID(); ?>" class="recent-post" >

 		 	<?php if (option::get('index_thumb') == 'on') { 

		 		if ( $video )  { ?>
	 
					<div class="video_cover"><?php echo embed_fix( $video, 680, 383 ); ?></div>

				<?php } else {  
	     			get_the_image( array( 'size' => 'loop', 'width' => option::get('thumb_width'), 'height' => option::get('thumb_height'), 'before' => '<div class="post-thumb">', 'after' => '</div>' ) );

	 			}
		    } ?>
	 		 
			<div class="post-content">	
				
				<?php if (option::get('display_category') == 'on') { ?><h4 class="cat-link"><?php the_category(', '); ?></h4><?php } ?>

				<h2 class="post-title"><a href="<?php the_permalink(); ?>" title="<?php printf( esc_attr__( 'Permalink to %s', 'wpzoom' ), the_title_attribute( 'echo=0' ) ); ?>" rel="bookmark"><?php the_title(); ?></a></h2>
	 
	 			<div class="entry">
					<?php if (option::get('display_content') == 'Full Content') {  the_content('<span>'.__('Read more', 'wpzoom').' &#8250;</span>'); } if (option::get('display_content') == 'Excerpt')  { the_excerpt(); } ?>
					
				</div><!-- /.entry -->
				
				<div class="clear"></div>
				
				<div class="recent-meta">
					<?php if (option::get('display_author') == 'on') { ?><span><?php _e('by', 'wpzoom'); ?> <?php the_author_posts_link(); ?></span> <span class="separator">&mdash;</span><?php } ?>
					<?php if (option::get('display_date') == 'on') { ?><span><?php printf( __('%s', 'wpzoom'),  get_the_date()); ?></span> <span class="separator">&mdash;</span><?php } ?>
					<?php if (option::get('display_comments') == 'on') { ?><span><?php comments_popup_link( __('0 comments', 'wpzoom'), __('1 comment', 'wpzoom'), __('% comments', 'wpzoom'), '', __('Comments are Disabled', 'wpzoom')); ?></span><?php } ?>
					 
					<?php edit_post_link( __('Edit', 'wpzoom'), '<span class="separator">&mdash;</span> <span>', '</span>'); ?>
				</div><!-- /.post-meta -->	
	  
			</div><!-- /.post-content -->
		
			<div class="clear"></div>

		</div><!-- #post-<?php the_ID(); ?> -->
		
	<?php endwhile; ?>
	
	<div class="clear"></div>
	
</div>

<?php get_template_part( 'pagination'); ?>

<?php wp_reset_query(); ?>