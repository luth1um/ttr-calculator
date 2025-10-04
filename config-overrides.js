module.exports = function override(config, env) {
  // avoid using outdated ESLint configs from peer dependencies
  config.plugins = config.plugins.filter((plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin');

  return config;
};
