<?php get_header(); ?>
<?php $template = get_post_meta($post->ID, 'wpzoom_post_template', true); ?>

<div id="main"<?php 
	  if ($template == 'side-left') {echo " class=\"side-left\"";}
	  if ($template == 'full') {echo " class=\"full-width\"";} 
	  ?>>

	<div class="inner-wrap">
	   
 		<div id="content">

				<?php if (option::get('post_category') == 'on') { ?><h4 class="cat-link"><?php the_category(', '); ?></h4><?php } ?>
			
				<h1 class="entry-title">
					<a href="<?php the_permalink(); ?>" title="<?php printf( esc_attr__( 'Permalink to %s', 'wpzoom' ), the_title_attribute( 'echo=0' ) ); ?>" rel="bookmark"><?php the_title(); ?></a>
				</h1>
			 
	 		 
	 			<?php while (have_posts()) : the_post(); ?>
	 		
				<div class="post-meta">
				
					<?php if (option::get('post_author') == 'on') { ?><?php _e('by', 'wpzoom'); ?> <span class="vcard author"><span class="fn"><?php the_author_posts_link(); ?></span></span> <span class="separator">&mdash;</span><?php } ?>
					<?php if (option::get('post_date') == 'on') { ?><?php printf( __('<span class="date updated">%s</span> at %s', 'wpzoom'),  get_the_date(), get_the_time()); ?><?php } ?>

					<?php edit_post_link( __('Edit', 'wpzoom'), '<span class="separator">&mdash;</span> ', ''); ?>
	 			</div><!-- /.post-meta -->
				
			  
				<div id="post-<?php the_ID(); ?>" <?php post_class('clearfix'); ?>>
					 
					<div class="entry">
						<?php the_content(); ?>
						<div class="clear"></div>
						
						<?php wp_link_pages( array( 'before' => '<div class="page-link"><span>' . __( 'Pages:', 'wpzoom' ) . '</span>', 'after' => '</div>' ) ); ?>
						<div class="clear"></div>
					
					</div><!-- / .entry -->
					<div class="clear"></div>
				 
				</div><!-- #post-<?php the_ID(); ?> -->
	 				
				<?php if (option::get('post_tags') == 'on') { ?><?php the_tags( '<div class="tag_list">'. __('Tags:', 'wpzoom'). ' ',', ', '</div>'); ?><?php } ?>
		 

				
				<?php if (option::get('post_share') == 'on') { ?>
					<div class="share_box">
						<h3><?php _e('Share', 'wpzoom'); ?></h3>
						<div class="share_btn"><a href="http://twitter.com/share" data-url="<?php the_permalink() ?>" class="twitter-share-button" data-count="horizontal">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div>
						<div class="share_btn"><iframe src="http://www.facebook.com/plugins/like.php?href=<?php echo urlencode(get_permalink($post->ID)); ?>&amp;layout=button_count&amp;show_faces=false&amp;width=1000&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe></div>
						<div class="share_btn"><g:plusone size="medium"></g:plusone></div>
						<div class="clear"></div>
					</div> 
				<?php } ?>
			 	
 	 		<div class="clear"></div>


 	 		<?php if ( option::get('post_authorbio') == 'on' ) { ?>

				<div class="post_author">

					<h3><?php _e( 'About the Author', 'wpzoom' ); ?></h3>

					<?php echo get_avatar( get_the_author_meta('ID') , 90 ); ?>

					<div class="details">

						<h4><?php the_author_posts_link(); ?></h4>

						<p class="description"><?php the_author_meta('description'); ?></p>

						<ul class="author_links">

							<li class="allposts"><a href="<?php echo get_author_posts_url( get_the_author_meta( 'ID' ) ); ?>"><?php _e( 'All posts', 'wpzoom' ); ?></a></li>
		  
							<?php if ( get_the_author_meta( 'twitter' ) ) { ?><li class="twitter"><a href="http://twitter.com/<?php echo get_the_author_meta( 'twitter' ); ?>" target="_blank"><?php _e( 'Follow me', 'wpzoom' ); ?></a></li><?php } ?>

		 				</ul>

						<div class="clear"></div>
					
					</div>

					<div class="clear"></div>

				</div>

			<?php } ?>
	 		 
			 
			<?php if (option::get('post_comments') == 'on') { 
				comments_template();
			} ?>
				
			<?php endwhile; ?>

		</div><!-- /#content -->
		
		
		<?php if ($template != 'full') { 
			get_sidebar(); 
		} else { echo "<div class=\"clear\"></div>"; } ?>
	 
	</div><!-- /.inner-wrap -->
</div><!-- /#main -->
<?php get_footer(); ?> 