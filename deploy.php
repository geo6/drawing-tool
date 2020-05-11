<?php

namespace Deployer;

require 'recipe/zend_framework.php';

// Project name
set('application', 'drawing-tool');

// Project repository
set('repository', 'https://github.com/geo6/drawing-tool.git');
set('branch', 'master');

// [Optional] Allocate tty for git clone. Default value is false.
set('git_tty', true);

// Shared files/dirs between deploys
add('shared_files', [
    'config.yml',
]);
add('shared_dirs', []);

// Writable dirs by web server
add('writable_dirs', []);
set('allow_anonymous_stats', false);

// Files/dirs to be deleted
set('clear_paths', [
    'node_modules',
    'resources',
    'deploy.php',
    'Procfile',
]);
after('deploy:update_code', 'deploy:clear_paths');

// Hosts
inventory('hosts.yml');

// Tasks

// [Optional] if deploy fails automatically unlock.
after('deploy:failed', 'deploy:unlock');
