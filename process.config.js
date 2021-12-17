module.exports = {
  apps: [
    {
      name: 'server',
      script: 'build/server.js',
      instances: 0,
      exec_mode: `cluster`
    }
  ]
}
