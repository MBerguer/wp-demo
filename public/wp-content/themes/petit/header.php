<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>
	<head>
		<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<link rel="stylesheet" type="text/css" href="<?php bloginfo('stylesheet_url'); ?>" media="screen" />

		<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

		<link href='http://fonts.googleapis.com/css?family=Lato:400,700,400italic|Copse' rel='stylesheet' type='text/css'>

 		<?php wp_head(); ?>
	</head>

	<body <?php body_class() ?>>
		<div id="wrapper">
			<div id="inner-wrap">
				<div id="header">
					<div id="logo">
						<?php if (!option::get('misc_logo_path')) { echo "<h1>"; } ?>

						<a href="<?php echo home_url(); ?>" title="<?php bloginfo('description'); ?>">
							<?php if (!option::get('misc_logo_path')) { bloginfo('name'); } else { ?>
								<img src="<?php echo ui::logo(); ?>" alt="<?php bloginfo('name'); ?>" />
							<?php } ?>
						</a>

						<?php if (!option::get('misc_logo_path')) { echo "</h1>"; } ?>

						<?php if (option::get('logo_desc') == 'on') {  ?><p id="tagline"><?php bloginfo('description'); ?></p><?php } ?>
					</div><!-- / #logo -->

					<?php get_search_form(); ?>

 					<div class="clear"></div>

					<div id="menu"<?php if (is_front_page() && $paged < 2 && option::get('featured_posts_show') == 'on' ) { echo ' class="home_menu"'; } ?>>

						<a class="btn_menu" id="toggle" href="#"><?php _e('Open menu', 'wpzoom'); ?></a>

 						<?php if (has_nav_menu( 'primary' )) {
							wp_nav_menu( array(
							'container' => 'menu',
							'container_class' => '',
							'menu_class' => 'dropdown',
							'menu_id' => 'mainmenu',
							'sort_column' => 'menu_order',
							'theme_location' => 'primary'
							));
						} else {
							echo '<p>Please set your Main navigation menu on the <strong><a href="'.get_admin_url().'nav-menus.php">Appearance > Menus</a></strong> page.</p>';
						} ?>

						<div class="clear"></div>
					</div>

					<div class="clear"></div>

				</div><!-- / #header-->