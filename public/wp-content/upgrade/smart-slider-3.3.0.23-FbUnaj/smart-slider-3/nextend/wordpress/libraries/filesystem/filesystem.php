<?php

/**
 * Class N2Filesystem
 */
class N2Filesystem extends N2FilesystemAbstract
{

    public function __construct() {
        $this->_basepath    = realpath(WP_CONTENT_DIR);
        $this->_librarypath = str_replace($this->_basepath, '', N2LIBRARY);
    }

    public static function getImagesFolder() {
        return N2Platform::getPublicDir();
    }

    public static function getWebCachePath() {
        self::check(self::getBasePath(), 'cache');
        if (is_multisite()) {
            return self::getBasePath() . '/cache/nextend/web' . get_current_blog_id();
        }
        return self::getBasePath() . '/cache/nextend/web';
    }

    public static function getNotWebCachePath() {
        if (is_multisite()) {
            return self::getBasePath() . '/cache/nextend/notweb' . get_current_blog_id();
        }
        return self::getBasePath() . '/cache/nextend/notweb';
    }
}