<?php get_header(); ?>

<div id="content-wrap">

	<div id="content">
	 
		<div class="post_content">
 			
			<h1 class="archive_title"><?php _e('Error 404 - Nothing Found', 'wpzoom'); ?></h1>
			<?php edit_post_link( __('Edit', 'wpzoom'), '', ''); ?>

			<div class="post clearfix">
			 
					<div class="entry">

						<p><?php _e('The page you are looking for could not be found. Maybe try one of the links below?', 'wpzoom');?> </p>

						<div class="col_arch">
							<div class="left"><?php _e('Popular Categories:', 'wpzoom'); ?></div>
						
							<div class="right"> 
								<ul>											  
	 								<?php wp_list_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'show_count' => 1, 'title_li' => '', 'hierarchical' => 0, 'number' => 10 ) ); ?>
								</ul>	
							</div>
						</div>
 
						<div class="col_arch">
							<div class="left"><?php _e('Archives:', 'wpzoom'); ?></div>
							
							<div class="right"> 
								<ul>											  
									<?php wp_get_archives('type=monthly&show_post_count=1') ?>	
								</ul>	
							</div>
						</div>

						<div class="col_arch">
							<div class="left"><?php _e('Tags:', 'wpzoom'); ?></div>
							
							<div class="right"> 
								<?php the_widget( 'WP_Widget_Tag_Cloud', 'title= ' ); ?>
							</div>
						</div>

 					</div><!-- / .entry --> 
	 				<div class="clear"></div>   
				    
				</div><!-- / .post -->

 			<div class="cleaner">&nbsp;</div>          
		</div><!-- / .post_content -->
 
	</div><!-- / #content -->
	
	<?php get_sidebar(); ?>

</div>
 
<?php get_footer(); ?>