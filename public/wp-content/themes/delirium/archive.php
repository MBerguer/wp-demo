<?php get_header(); 
	if (is_author()) { 
		$curauth = (isset($_GET['author_name'])) ? get_user_by('slug', $author_name) : get_userdata(intval($author));
	}
?>

<div id="main" role="main">

	<div class="inner-wrap">
 
		<div id="content">
		
			<h1 class="archive_title"> 
				<?php /* category archive */ if (is_category()) { ?> <?php single_cat_title(); ?>
				<?php /* tag archive */ } elseif( is_tag() ) { ?><?php _e('Post Tagged with:', 'wpzoom'); ?> "<?php single_tag_title(); ?>"
				<?php /* daily archive */ } elseif (is_day()) { ?><?php _e('Archive for', 'wpzoom'); ?> <?php the_time('F jS, Y'); ?>
				<?php /* monthly archive */ } elseif (is_month()) { ?><?php _e('Archive for', 'wpzoom'); ?> <?php the_time('F, Y'); ?>
				<?php /* yearly archive */ } elseif (is_year()) { ?><?php _e('Archive for', 'wpzoom'); ?> <?php the_time('Y'); ?>
				<?php /* author archive */ } elseif (is_author()) { ?><?php echo get_avatar( $curauth->ID , 65 ); _e( ' Articles by: ', 'wpzoom' ); echo $curauth->display_name; ?>  
				<?php /* paged archive */ } elseif (isset($_GET['paged']) && !empty($_GET['paged'])) { ?><?php _e('Archives', 'wpzoom'); } ?>
			</h1>
			
	    
			<?php get_template_part('loop'); ?>
	 			
		</div> <!-- /#content -->
		
		<?php get_sidebar(); ?> 
	
	</div><!-- /.inner-wrap -->

</div> <!-- /#main -->

<?php get_footer(); ?> 