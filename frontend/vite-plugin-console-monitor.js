import { WebSocketServer } from 'ws';

export default function consoleMonitorPlugin() {
  let wss;

  return {
    name: 'console-monitor',

    configureServer(server) {
      wss = new WebSocketServer({ port: 9000 });

      wss.on('connection', (ws) => {
        console.log('🔍 Console monitor connected');

        ws.on('message', (data) => {
          const log = JSON.parse(data);

          if (log.type === 'error') {
            console.error('❌ Browser Error:', ...log.args);
            if (log.stack) console.error(log.stack);
          } else if (log.type === 'warn') {
            console.warn('⚠️  Browser Warning:', ...log.args);
          } else {
            console.log('📝 Browser Log:', ...log.args);
          }
        });
      });

      // Auto-inject console forwarder
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__console_forwarder__') {
          res.setHeader('Content-Type', 'application/javascript');
          res.end(`
            (function() {
              const ws = new WebSocket('ws://localhost:9000');

              const send = (type, args) => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type,
                    args: args.map(a => String(a)),
                    timestamp: Date.now(),
                  }));
                }
              };

              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;

              console.log = (...args) => {
                originalLog(...args);
                send('log', args);
              };

              console.error = (...args) => {
                originalError(...args);
                send('error', args);
              };

              console.warn = (...args) => {
                originalWarn(...args);
                send('warn', args);
              };

              window.addEventListener('error', (e) => {
                send('error', [e.message, e.error?.stack]);
              });

              window.addEventListener('unhandledrejection', (e) => {
                send('error', ['Unhandled Promise:', e.reason]);
              });
            })();
          `);
        } else {
          next();
        }
      });
    },

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: {
            src: '/__console_forwarder__',
            type: 'module'
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}
