const os = require('os');
const http = require('http');
const cluster = require('cluster');
const { createProxyServer } = require('http-proxy');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const numCPUs = os.cpus().length;
const MAX_PODS = 10;
let numPods = Math.min(4, numCPUs);
const PORT = 8082;

if (cluster.isMaster) {
    console.log('🟢 Servidor Maestro iniciado en el puerto:', PORT);
    const pods = [];
    const podsStats = {};

    for (let i = 0; i < numPods; i++) {
        const pod = cluster.fork();
        pods.push(pod);
    }

    const monitorPORT = 8080;
    const app = express();
    app.use(express.static(path.join(__dirname, 'public')));

    // Si usas EJS, agrégalo. Si no, cambia `res.render()` por `res.send()`
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.get('/stats', (req, res) => {
        res.render('stats');
        //res.send("Dashboard del Servidor Maestro");
    });

    app.get('/api/stats', (req, res) => {
        res.json({
            master: {
                pid: process.pid,
                cpu: os.loadavg()[0].toFixed(2),
                memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
                podsCount: pods.length
            },
            pods: Object.values(podsStats)
        });
    });
 //Eliminar el Pod
 app.delete('/api/remove-pod/:pid', (req, res) => {
    const pid = parseInt(req.params.pid); // Convertimos a número
    const podIndex = pods.findIndex(p => p.process.pid === pid);

    if (podIndex !== -1) {
        pods[podIndex].process.kill(); // Matamos el proceso
        pods.splice(podIndex, 1); // Lo eliminamos de la lista
        delete podsStats[pid]; // También lo eliminamos del objeto de estadísticas
        console.log(`✅ Pod ${pid} eliminado`);
        return res.json({ message: `Pod ${pid} eliminado correctamente` });
    } else {
        return res.status(404).json({ message: `❌ Pod ${pid} no encontrado` });
    }
});

//Fin Eliminar el Pod
    app.listen(monitorPORT, () => {
        console.log('📊 Servidor de monitoreo en el puerto:', monitorPORT);
    });

    let podSeleccionado = 0;
    const proxy = createProxyServer();

    const server = http.createServer((req, res) => {
        if (pods.length === 0) {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
            res.end('⚠️ No hay pods disponibles');
            return;
        }

        const podPORT = 3000 + podSeleccionado;
        podSeleccionado = (podSeleccionado + 1) % pods.length;
        const target = `http://localhost:${podPORT}`;

        proxy.web(req, res, { target }, (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('❌ Error en el Balanceador de Carga');
            console.error('Error al redirigir la petición a', target, err);
        });
    });

    server.listen(PORT, () => {
        console.log('⚖️ Balanceador de carga en el puerto:', PORT);
    });

    cluster.on('exit', (pod) => {
        console.log(`⚠️ Pod ${pod.process.pid} murió. Creando nuevo pod...`);
        const newPod = cluster.fork();
        pods[pods.indexOf(pod)] = newPod;
    });
        /*if (podIndex !== -1){
            pods[podIndex] = newPod;
        pods[pods.indexOf(pod)] = newPod;
        }else{
            pods.push(newPod);
        
        }*/
    

    cluster.on('online', (pod) => {
        pod.on('message', (message) => {
            if (message.stats) {
                podsStats[pod.process.pid] = {
                    pid: pod.process.pid,
                    cpu: message.stats.cpu,
                    memory: message.stats.memory
                };
            }
        });
    });

    setInterval(() => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
        const cpuUsage = os.loadavg()[0] / numCPUs * 100;
        console.log('⚡ Servidor maestro:', process.pid, 'CPU:', cpuUsage.toFixed(2), '%', 'Memoria:', memoryUsage.toFixed(2), 'MB');

        if (cpuUsage > 70 && pods.length < MAX_PODS) {
            console.log('🔥 Alta carga de CPU, creando un nuevo pod...');
            const newPod = cluster.fork();
            pods.push(newPod);
            numPods++;
        }
    }, 5000);

} else {
    const app = express();
    const podPORT = 3000 + cluster.worker.id;

    app.use(bodyParser.json());
    app.use(cors());

    const usersRoutes = require('./routes/usersRoutes');
    const citasRoutes = require('./routes/citasRoutes');

    app.use('/api/users', usersRoutes);
    app.use('/api/citas', citasRoutes);

    app.listen(podPORT, () => {
        console.log(`🟢 Pod ${process.pid} en el puerto ${podPORT}`);
        process.send({ port: podPORT });
    });

    setInterval(() => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
        const cpuUsage = os.loadavg()[0] / numCPUs * 100;
        process.send({ stats: { cpu: cpuUsage.toFixed(2), memory: memoryUsage.toFixed(2) } });
    }, 5000);
}

