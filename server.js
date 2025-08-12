import express from "express";
import bodyParser from "body-parser";
import fs from "fs-extra";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Arquivos JSON
const KEYS_FILE = "./keys.json";
const USERS_FILE = "./users.json";

// Garante que os arquivos existam
fs.ensureFileSync(KEYS_FILE);
fs.ensureFileSync(USERS_FILE);
if (!fs.readJsonSync(KEYS_FILE, { throws: false })) fs.writeJsonSync(KEYS_FILE, []);
if (!fs.readJsonSync(USERS_FILE, { throws: false })) fs.writeJsonSync(USERS_FILE, []);

// Verificar e registrar key
app.post("/login", async (req, res) => {
    const { key, hwid } = req.body;

    let keys = await fs.readJson(KEYS_FILE);
    let users = await fs.readJson(USERS_FILE);

    // 1 - Checar se key está disponível
    const keyIndex = keys.indexOf(key);
    if (keyIndex !== -1) {
        // Remover do keys.json e adicionar no users.json
        keys.splice(keyIndex, 1);
        users.push({ key, hwid });
        await fs.writeJson(KEYS_FILE, keys);
        await fs.writeJson(USERS_FILE, users);
        return res.json({ success: true, message: "Key ativada e vinculada ao HWID." });
    }

    // 2 - Checar se já está registrada
    const user = users.find(u => u.key === key);
    if (!user) return res.status(400).json({ success: false, message: "Key inválida." });

    if (user.hwid !== hwid)
        return res.status(400).json({ success: false, message: "HWID não corresponde." });

    return res.json({ success: true, message: "Login autorizado." });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
