<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>
	<head>
		<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<link rel="stylesheet" type="text/css" href="<?php bloginfo('stylesheet_url'); ?>" media="screen" />

		<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,700|Cardo:400,700,400italic&subset=latin,cyrillic' rel='stylesheet' type='text/css'>

		<?php wp_head(); ?>
	</head>

	<body <?php body_class() ?>>
		<?php global $woocommerce; ?>

		<div id="header">

			<div class="inner-wrap">

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


				<?php if (option::get('ad_head_select') == 'on') { ?>
					<div class="adv">

						<?php if ( option::get('ad_head_code') <> "") {
							echo stripslashes(option::get('ad_head_code'));
						} else { ?>
							<a href="<?php echo option::get('banner_top_url'); ?>"><img src="<?php echo option::get('banner_top'); ?>" alt="<?php echo option::get('banner_top_alt'); ?>" /></a>
						<?php } ?>

					</div><!-- /.adv -->

				<?php } ?>
				<div class="clear"></div>

			</div><!-- /.inner-wrap -->


			<div id="menu">

				<div class="inner-wrap">

					<a class="btn_menu" id="toggle" href="#"></a>

					<?php
					if (current_theme_supports('woocommerce') && option::get('cart_icon') == 'on') {

						$cart_button = '<a href="' . $woocommerce->cart->get_cart_url() . '" title="' . __( 'View your shopping cart', 'wpzoom' ) . '" class="cart-contents">' . '<span>' . sprintf(_n( '%d item &ndash; ', '%d items &ndash; ', $woocommerce->cart->get_cart_contents_count(), 'wpzoom'), $woocommerce->cart->get_cart_contents_count()) . $woocommerce->cart->get_cart_total() . '</span></a>';

						echo $cart_button;

					}
					?>


					<div id="menu-wrap">

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

					</div>


					<div class="clear"></div>

				</div><!-- /.inner-wrap -->

			</div><!-- /#menu -->

			<div class="clear"></div>

		</div><!-- / #header-->