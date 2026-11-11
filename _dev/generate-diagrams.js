const fs = require('fs');
const path = require('path');

const dbJsPath = path.join(__dirname, 'backend', 'services', 'database.js');
const content = fs.readFileSync(dbJsPath, 'utf8');

// Extract the initializeDatabase SQL block
const sqlMatch = content.match(/db\.exec\(`([\s\S]*?)`\);/);
if (!sqlMatch) {
    console.error('Could not find SQL block');
    process.exit(1);
}
const sql = sqlMatch[1];

const tables = [];
const relationships = [];

// Parse CREATE TABLE statements
const tableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g;
let match;
while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];

    const columns = [];
    const lines = body.split(',').map(s => s.trim()).filter(Boolean);

    for (let line of lines) {
        line = line.replace(/--.*$/, '').trim();
        if (!line) continue;

        // Foreign key
        const fkMatch = line.match(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/i);
        if (fkMatch) {
            relationships.push({
                fromTable: tableName,
                fromCol: fkMatch[1].trim(),
                toTable: fkMatch[2].trim(),
                toCol: fkMatch[3].trim()
            });
            continue;
        }

        // Index or constraint skip
        if (/^(CREATE INDEX|PRIMARY KEY|FOREIGN KEY|CHECK|UNIQUE)/i.test(line)) continue;

        // Column definition
        const colMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+([A-Z]+)(.*)$/);
        if (colMatch) {
            const name = colMatch[1];
            const type = colMatch[2];
            const rest = colMatch[3];
            const isPK = /PRIMARY KEY/i.test(rest);
            const isFK = /REFERENCES/i.test(rest);
            const isUnique = /UNIQUE/i.test(rest);
            const isNotNull = /NOT NULL/i.test(rest);
            columns.push({ name, type, isPK, isFK, isUnique, isNotNull });
        }
    }

    tables.push({ name: tableName, columns });
}

// Generate Mermaid ER diagram
let mermaid = 'erDiagram\n';
for (const table of tables) {
    mermaid += `    ${table.name} {\n`;
    for (const col of table.columns) {
        let type = col.type.toLowerCase();
        let name = col.name;
        if (col.isPK) name += ' PK';
        if (col.isFK) name += ' FK';
        if (col.isUnique && !col.isPK) name += ' UK';
        mermaid += `        ${type} ${name}\n`;
    }
    mermaid += '    }\n';
}

for (const rel of relationships) {
    mermaid += `    ${rel.toTable} ||--o{ ${rel.fromTable} : "${rel.fromCol}"\n`;
}

// Generate HTML
const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PSB SecureWealth - Relational Schema Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body { margin: 0; padding: 40px; background: #ffffff; font-family: system-ui, sans-serif; }
        h1 { text-align: center; color: #064e3b; margin-bottom: 30px; }
        .mermaid { display: flex; justify-content: center; }
    </style>
</head>
<body>
    <h1>PSB SecureWealth Twin - Relational Schema Diagram</h1>
    <div class="mermaid">
${mermaid}
    </div>
    <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</body>
</html>`;

const outDir = path.join(__dirname, 'diagrams');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

fs.writeFileSync(path.join(outDir, 'relational-schema.html'), html);
console.log('Generated relational-schema.html');

// Save mermaid source too
fs.writeFileSync(path.join(outDir, 'relational-schema.mmd'), mermaid);
console.log('Generated relational-schema.mmd');
