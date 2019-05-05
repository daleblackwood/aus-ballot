/* tsconfig: disable */

const path = require('path')
const { addWebpackAlias } = require('customize-cra')

module.exports = function override(config, env) {
    config = addWebpackAlias({
        ['@common']: path.resolve(__dirname, '../common')
    })(config)

    return config
}
