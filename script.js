const packages = {
    '1': { ram: 1024, disk: 5120, cpu: 100 },
    '2': { ram: 2048, disk: 10240, cpu: 200 },
    '3': { ram: 3072, disk: 15360, cpu: 300 },
    '4': { ram: 4096, disk: 20480, cpu: 400 },
    '6': { ram: 6144, disk: 30720, cpu: 600 },
    '8': { ram: 8192, disk: 40960, cpu: 800 }
};

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Memproses...';

    const domain = config.domain;
    const apiKey = config.ptla;

    const packageKey = document.getElementById('package').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let serverName = document.getElementById('serverName').value.trim();

    if (!packageKey) {
        resultDiv.innerHTML = '❌ Pilih paket terlebih dahulu.';
        return;
    }
    if (!email || !password) {
        resultDiv.innerHTML = '❌ Email dan password harus diisi.';
        return;
    }
    if (password.length < 8) {
        resultDiv.innerHTML = '❌ Password minimal 8 karakter.';
        return;
    }

    const spec = packages[packageKey];
    if (!spec) {
        resultDiv.innerHTML = '❌ Paket tidak valid.';
        return;
    }

    const username = email.split('@')[0];
    if (!serverName) serverName = `Server ${username}`;

    try {
        resultDiv.innerHTML = 'Membuat akun...';
        const userPayload = {
            email: email,
            username: username,
            first_name: username,
            last_name: '',
            password: password,
            root_admin: false,
            language: 'en'
        };

        const userResponse = await fetch(`${domain}/api/application/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userPayload)
        });

        const userData = await userResponse.json();
        if (!userResponse.ok) {
            resultDiv.innerHTML = '<strong>❌ Gagal membuat user:</strong><pre>' + JSON.stringify(userData, null, 2) + '</pre>';
            return;
        }

        const userId = userData.attributes.id;
        resultDiv.innerHTML = `✅ User berhasil dibuat (ID: ${userId}). Membuat server...`;

        const serverPayload = {
            name: serverName,
            user: userId,
            egg: parseInt(config.eggs),
            nest: parseInt(config.nests),
            description: 'Dibuat via web register tool',
            limits: {
                memory: spec.ram,
                swap: 0,
                disk: spec.disk,
                io: 500,
                cpu: spec.cpu
            },
            feature_limits: {
                databases: 1,
                allocations: 1,
                backups: 1
            },
            allocation: {
                default: parseInt(config.loc)
            }
        };

        const serverResponse = await fetch(`${domain}/api/application/servers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(serverPayload)
        });

        const serverData = await serverResponse.json();
        if (serverResponse.ok) {
            resultDiv.innerHTML = '<strong>✅ Akun dan server berhasil dibuat!</strong><br>' +
                `Email: ${email}<br>Password: (sesuai input)<br>` +
                `Paket: ${packageKey}GB (RAM: ${spec.ram}MB, Disk: ${spec.disk}MB, CPU: ${spec.cpu}%)<br>` +
                '<pre>' + JSON.stringify(serverData, null, 2) + '</pre>';
        } else {
            resultDiv.innerHTML = '<strong>❌ User berhasil dibuat, tapi gagal membuat server:</strong><pre>' + JSON.stringify(serverData, null, 2) + '</pre>';
        }
    } catch (error) {
        resultDiv.innerHTML = '❌ Error: ' + error.message;
    }
});